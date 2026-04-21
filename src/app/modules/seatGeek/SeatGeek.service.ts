import {
  prisma,
  type SeatGeekSyncState,
  SystemSource,
} from '../../../utils/db';
import { errorLogger } from '../../../utils/logger';
import { SystemEventServices } from '../systemEvent/SystemEvent.service';
import { SystemPerformerServices } from '../systemPerformer/SystemPerformer.service';
import { SystemVenueServices } from '../systemVenue/SystemVenue.service';
import type {
  SGEvent,
  SGEventsResponse,
  SGPerformer,
} from './SeatGeek.interface';
import { seatGeekClient } from './SeatGeek.lib';

const PER_PAGE = 20;
const DAYS_AHEAD = 40;
const PAGE_CONCURRENCY = 3;
const EVENT_CONCURRENCY = 5;

// ─── Config Cache ─────────────────────────────────────────────────────────────

let _config: SeatGeekSyncState | null = null;

// ─── Run-scoped Deduplication Cache ──────────────────────────────────────────
//
// Promise-based maps prevent duplicate DB calls under concurrent processing.
//
// Problem without Promise cache:
//   Event A and Event B both share Venue X and run concurrently.
//   Both call cache.venues.get('venue-x') → both get undefined (promise not set yet).
//   Both fire createORUpdateSystemVenue → 2 DB writes for identical data.
//
// With Promise cache:
//   Event A misses cache → creates Promise, stores it immediately → fires DB call.
//   Event B misses cache? No — Promise is already stored → awaits same Promise.
//   Result: exactly 1 DB write, both get the same venue id.
//
// venues: safe to cache — buildVenuePayload has no event_id or performer_id.
//         nightly reset + re-upsert keeps venue data fresh each run.
//
// genres: safe to cache — createOrUpdateSystemGenre has no event_id or performer_id.
//         createOrGetSystemPerformerGenre still runs per performer (not cached)
//         to ensure every performer→genre link is always maintained.
//
// performers: NOT cached — buildPerformerPayload includes event_id.
//             Must upsert per event to:
//             (1) keep performer data fresh (score, image, etc.)
//             (2) create the correct event_id link for each event.

interface SyncCache {
  venues: Map<string, Promise<string>>; // sg venue source_id → Promise<db venue id>
  genres: Map<string, Promise<string>>; // sg genre source_id → Promise<db genre id>
}

function createSyncCache(): SyncCache {
  return {
    venues: new Map(),
    genres: new Map(),
  };
}

// ─── Concurrency Util ─────────────────────────────────────────────────────────

async function runConcurrent<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += concurrency) {
    await Promise.all(items.slice(i, i + concurrency).map(fn));
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const SeatGeekServices = {
  async config(): Promise<SeatGeekSyncState> {
    if (!_config) {
      const existing = await prisma.seatGeekSyncState.findFirst();

      _config =
        existing ??
        (await prisma.seatGeekSyncState.create({
          data: {
            required_event_count: 10,
            last_synced_at: new Date(0),
          },
        }));
    }

    return _config;
  },

  async resetDailySync(): Promise<void> {
    const current = await this.config();

    const updated = await prisma.seatGeekSyncState.update({
      where: { id: current.id },
      data: {
        imported_event_count: 0,
        total_event_count: 0,
        sync_progress: 0,
      },
    });

    _config = updated;
  },

  async updateProgress(
    batchSize: number,
    totalCount: number,
  ): Promise<SeatGeekSyncState> {
    const current = await this.config();

    const newImported = current.imported_event_count + batchSize;
    const progress = totalCount === 0 ? 0 : (newImported * 100) / totalCount;

    const updated = await prisma.seatGeekSyncState.update({
      where: { id: current.id },
      data: {
        last_synced_at: new Date(),
        imported_event_count: { increment: batchSize },
        total_event_count: totalCount,
        sync_progress: Math.min(100, progress),
      },
    });

    _config = updated;

    return updated;
  },

  async fetchSeatGeekEvents(
    {
      taxonomies,
      ...reqOptions
    }: { taxonomies?: Array<{ name: string }>; [key: string]: any },
    page = 1,
    per_page = 100,
  ): Promise<SGEventsResponse> {
    const params: Record<string, any> = { page, per_page, ...reqOptions };

    if (taxonomies?.length) {
      params['taxonomies.name'] = taxonomies.map(t => t.name).join(',');
    }

    const response = await seatGeekClient.get<SGEventsResponse>('/events', {
      params,
    });

    return response.data;
  },

  async processEventData({ events }: SGEventsResponse): Promise<void> {
    const cache = createSyncCache();
    for (const eventSG of events) {
      await processEvent(eventSG, cache);
    }
  },

  async runFullSync(): Promise<void> {
    await this.resetDailySync();

    const now = new Date();
    const future = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

    const dateParams = {
      'datetime_utc.gte': now.toISOString().split('T')[0],
      'datetime_utc.lte': future.toISOString().split('T')[0],
    };

    console.log(
      `[Sync] Date range: %s → %s`,
      dateParams['datetime_utc.gte'],
      dateParams['datetime_utc.lte'],
    );

    // ── Step 1: Fetch page 1 to discover total ────────────────────────────────

    const firstPage = await this.fetchSeatGeekEvents(dateParams, 1, PER_PAGE);
    const total = firstPage.meta.total;
    const totalPages = Math.ceil(total / PER_PAGE);

    console.log(`[Sync] Total events: %d across %d pages`, total, totalPages);

    // ── Step 2: Fetch remaining pages concurrently ────────────────────────────

    const allEvents = [...firstPage.events];

    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2,
    );

    await runConcurrent(remainingPages, PAGE_CONCURRENCY, async page => {
      const data = await this.fetchSeatGeekEvents(dateParams, page, PER_PAGE);
      allEvents.push(...data.events);
      console.log(`[Sync] Fetched page %d / %d`, page, totalPages);
    });

    console.log(
      `[Sync] All pages fetched. Processing %d events...`,
      allEvents.length,
    );

    // ── Step 3: Process all events concurrently with shared cache ─────────────

    const cache = createSyncCache();
    let processed = 0;
    let failed = 0;

    await runConcurrent(allEvents, EVENT_CONCURRENCY, async eventSG => {
      try {
        await processEvent(eventSG, cache);
        processed++;
      } catch (err) {
        failed++;
        errorLogger.error(
          `[Sync] Failed event "${eventSG.title}" (ID: ${eventSG.id}):`,
          err,
        );
      }
    });

    await this.updateProgress(processed, total);

    console.log(
      `[Sync] Done — processed: %d, failed: %d, total available: %d`,
      processed,
      failed,
      total,
    );
  },
};

// ─── Payload Builders ─────────────────────────────────────────────────────────

function buildVenuePayload(eventSG: SGEvent) {
  return {
    name: eventSG.venue.name,
    address: eventSG.venue.address,
    city: eventSG.venue.city,
    state: eventSG.venue.state,
    country: eventSG.venue.country,
    zip: eventSG.venue.postal_code,
    latitude: eventSG.venue.location.lat,
    longitude: eventSG.venue.location.lon,
    capacity: eventSG.venue.capacity,
    score: eventSG.venue.score,
    source: SystemSource.SEATGEEK,
    source_id: eventSG.venue.id.toString(),
    source_url: eventSG.venue.url,
  } satisfies Parameters<
    typeof SystemVenueServices.createORUpdateSystemVenue
  >[0];
}

function buildEventPayload(eventSG: SGEvent, venueId: string) {
  return {
    venue_id: venueId,
    name: eventSG.title,
    address: eventSG.venue.address,
    city: eventSG.venue.city,
    state: eventSG.venue.state,
    zip: eventSG.venue.postal_code,
    country: eventSG.venue.country,
    latitude: eventSG.venue.location.lat,
    longitude: eventSG.venue.location.lon,
    source: SystemSource.SEATGEEK,
    source_id: eventSG.id.toString(),
    source_url: eventSG.url,
    date: new Date(
      eventSG.datetime_utc.endsWith('Z')
        ? eventSG.datetime_utc
        : eventSG.datetime_utc + 'Z',
    ),
  } satisfies Parameters<
    typeof SystemEventServices.createOrUpdateSystemEvent
  >[0];
}

function buildPerformerPayload(
  performerSG: SGPerformer,
  eventId: string,
  eventSG: SGEvent,
) {
  return {
    name: performerSG.name,
    source: SystemSource.SEATGEEK,
    source_id: performerSG.id.toString(),
    source_url: performerSG.url,
    image: performerSG.images.huge ?? performerSG.image,
    score: performerSG.score,
    event_id: eventId, //? connect performer to event in the same step
    address: eventSG.venue.address,
    city: eventSG.venue.city,
    state: eventSG.venue.state,
    zip: eventSG.venue.postal_code,
    country: eventSG.venue.country,
    latitude: eventSG.venue.location.lat,
    longitude: eventSG.venue.location.lon,
  } satisfies Parameters<
    typeof SystemPerformerServices.createOrUpdateSystemPerformer
  >[0];
}

// ─── Processors ───────────────────────────────────────────────────────────────

async function processGenres(
  performerSG: SGPerformer,
  performerId: string,
  performerName: string,
  cache: SyncCache,
) {
  if (!performerSG.genres?.length) return;

  await Promise.all(
    performerSG.genres.map(async genreSG => {
      console.log(
        `[Genre] Processing "%s" for performer: %s (ID: %s)`,
        genreSG.name,
        performerName,
        performerId,
      );

      const sourceId = genreSG.id.toString();

      // Cache the genre upsert Promise — genre payload has no performer_id or
      // event_id so the same DB row is always the result. Avoids N upserts for
      // the same genre when multiple performers share it within one sync run.
      let genrePromise = cache.genres.get(sourceId);
      if (!genrePromise) {
        genrePromise = SystemPerformerServices.createOrUpdateSystemGenre({
          name: genreSG.name,
          source: SystemSource.SEATGEEK,
          source_id: sourceId,
          image: genreSG.images.huge ?? genreSG.image,
          slug: genreSG.slug,
        }).then(g => g.id);
        cache.genres.set(sourceId, genrePromise);
      }

      const genreId = await genrePromise;

      // Always run — links this specific performer to the genre.
      await SystemPerformerServices.createOrGetSystemPerformerGenre({
        performer_id: performerId,
        genre_id: genreId,
      });
    }),
  );
}

async function processPerformers(
  eventSG: SGEvent,
  eventId: string,
  eventName: string,
  cache: SyncCache,
) {
  await Promise.all(
    eventSG.performers.map(async performerSG => {
      console.log(
        `[Performer] Processing "%s" (ID: %s) for event: %s (ID: %s)`,
        performerSG.name,
        performerSG.id,
        eventName,
        eventId,
      );

      // Performers are NOT cached — buildPerformerPayload includes event_id.
      // Must upsert every time to: (1) keep data fresh, (2) maintain event link.
      const performer =
        await SystemPerformerServices.createOrUpdateSystemPerformer(
          buildPerformerPayload(performerSG, eventId, eventSG),
        );

      await processGenres(performerSG, performer.id, performer.name, cache);
    }),
  );
}

async function processEvent(eventSG: SGEvent, cache: SyncCache) {
  console.log(`[Event] Processing "%s" (ID: %s)`, eventSG.title, eventSG.id);

  const venueSourceId = eventSG.venue.id.toString();

  // Cache the venue upsert Promise — venue payload has no event_id or
  // performer_id so the same DB row is always the result.
  let venuePromise = cache.venues.get(venueSourceId);
  if (!venuePromise) {
    venuePromise = SystemVenueServices.createORUpdateSystemVenue(
      buildVenuePayload(eventSG),
    ).then(v => v.id);
    cache.venues.set(venueSourceId, venuePromise);
  }

  const venueId = await venuePromise;

  const event = await SystemEventServices.createOrUpdateSystemEvent(
    buildEventPayload(eventSG, venueId),
  );

  console.log(
    `[Event] Upserted "%s" (ID: %s) → venue ID: %s`,
    event.name,
    event.id,
    venueId,
  );

  await processPerformers(eventSG, event.id, event.name, cache);
}
