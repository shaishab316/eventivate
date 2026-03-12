import { debuglog as debug } from 'node:util';
import {
  prisma,
  type SeatGeekSyncState,
  SystemSource,
} from '../../../utils/db';
import { SystemEventServices } from '../systemEvent/SystemEvent.service';
import { SystemPerformerServices } from '../systemPerformer/SystemPerformer.service';
import { SystemVenueServices } from '../systemVenue/SystemVenue.service';
import type {
  SGEvent,
  SGEventsResponse,
  SGPerformer,
} from './SeatGeek.interface';
import { seatGeekClient } from './SeatGeek.lib';

const debugLog = debug('app:seatgeek:service');

// ─── Config Cache ─────────────────────────────────────────────────────────────

let _config: SeatGeekSyncState | null = null;

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
    for (const eventSG of events) {
      await processEvent(eventSG);
    }
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
  } satisfies Parameters<
    typeof SystemEventServices.createOrUpdateSystemEvent
  >[0];
}

function buildPerformerPayload(performerSG: SGPerformer, eventId: string) {
  return {
    name: performerSG.name,
    source: SystemSource.SEATGEEK,
    source_id: performerSG.id.toString(),
    source_url: performerSG.url,
    image: performerSG.images.huge ?? performerSG.image,
    score: performerSG.score,
    event_id: eventId, //? connect performer to event in the same step
  } satisfies Parameters<
    typeof SystemPerformerServices.createOrUpdateSystemPerformer
  >[0];
}

// ─── Processors ───────────────────────────────────────────────────────────────

async function processGenres(
  performerSG: SGPerformer,
  performerId: string,
  performerName: string,
) {
  if (!performerSG.genres?.length) return;

  for (const genreSG of performerSG.genres) {
    debugLog(
      `[Genre] Processing "%s" for performer: %s (ID: %s)`,
      genreSG.name,
      performerName,
      performerId,
    );

    const genre = await SystemPerformerServices.createOrUpdateSystemGenre({
      name: genreSG.name,
      source: SystemSource.SEATGEEK,
      source_id: genreSG.id.toString(),
      image: genreSG.images.huge ?? genreSG.image,
      slug: genreSG.slug,
    });

    await SystemPerformerServices.createOrGetSystemPerformerGenre({
      performer_id: performerId,
      genre_id: genre.id,
    });
  }
}

async function processPerformers(
  eventSG: SGEvent,
  eventId: string,
  eventName: string,
) {
  for (const performerSG of eventSG.performers) {
    debugLog(
      `[Performer] Processing "%s" (ID: %s) for event: %s (ID: %s)`,
      performerSG.name,
      performerSG.id,
      eventName,
      eventId,
    );

    const performer =
      await SystemPerformerServices.createOrUpdateSystemPerformer(
        buildPerformerPayload(performerSG, eventId),
      );

    await processGenres(performerSG, performer.id, performer.name);
  }
}

async function processEvent(eventSG: SGEvent) {
  debugLog(`[Event] Processing "%s" (ID: %s)`, eventSG.title, eventSG.id);

  const venue = await SystemVenueServices.createORUpdateSystemVenue(
    buildVenuePayload(eventSG),
  );
  const event = await SystemEventServices.createOrUpdateSystemEvent(
    buildEventPayload(eventSG, venue.id),
  );

  debugLog(
    `[Event] Upserted "%s" (ID: %s) → venue: "%s" (ID: %s)`,
    event.name,
    event.id,
    venue.name,
    venue.id,
  );

  await processPerformers(eventSG, event.id, event.name);
}
