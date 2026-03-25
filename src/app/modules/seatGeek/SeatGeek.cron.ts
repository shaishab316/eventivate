import cron, { ScheduledTask } from 'node-cron';
import { debuglog as debug } from 'node:util';
import { errorLogger } from '../../../utils/logger';
import { SeatGeekServices } from './SeatGeek.service';

const debugLog = debug('app:cron:seatgeek');

let job: ScheduledTask | null = null;

// const CRON_EXPRESSION = '*/15 * * * *';
// const PER_PAGE = 20;
// const MAX_ERROR_COUNT = 10;

// for testing purposes, run every minute with fewer items per page
// const CRON_EXPRESSION = '*/1 * * * *';
const CRON_EXPRESSION = '*/1 1-3 * * *'; //? for testing, run every minute during 1-3am when traffic is low
const PER_PAGE = 5;
const MAX_ERROR_COUNT = 10;

// ─── Error Counter ────────────────────────────────────────────────────────────

const errorCounter = {
  count: 0,
  increment() {
    this.count += 1;
  },
  reset() {
    this.count = 0;
  },
  hasExceededLimit() {
    return this.count >= MAX_ERROR_COUNT;
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stopJob() {
  job?.stop();
  job?.destroy();
  job = null;
}

// ─── Core Logic ───────────────────────────────────────────────────────────────

async function isSyncComplete(): Promise<boolean> {
  const cfg = await SeatGeekServices.config();

  const done =
    cfg.imported_event_count >= cfg.required_event_count ||
    cfg.sync_progress >= 100;

  if (done) {
    debugLog(
      `[Cron] Sync complete — imported: %d, required: %d, progress: %d%%`,
      cfg.imported_event_count,
      cfg.required_event_count,
      cfg.sync_progress,
    );
  }

  return done;
}

async function fetchAndProcessEvents(): Promise<void> {
  const cfg = await SeatGeekServices.config();

  const currentPage = Math.floor(cfg.imported_event_count / PER_PAGE) + 1;

  debugLog(
    `[Cron] Fetching page %d (per_page: %d, imported so far: %d)`,
    currentPage,
    PER_PAGE,
    cfg.imported_event_count,
  );

  const data = await SeatGeekServices.fetchSeatGeekEvents(
    {}, // no data in concert event { taxonomies: [{ name: 'concert' }, { name: 'concerts' }] },
    currentPage,
    PER_PAGE,
  );

  debugLog(`[Cron] Fetched %d events`, data.events.length);

  await SeatGeekServices.processEventData(data);
  await SeatGeekServices.updateProgress(data.events.length, data.meta.total);

  debugLog(
    `[Cron] Progress updated — batch: %d, total available: %d`,
    data.events.length,
    data.meta.total,
  );
}

async function processSeatGeekData(): Promise<void> {
  if (await isSyncComplete()) {
    stopJob();
    debugLog(`[Cron] Cron job stopped.`);
    return;
  }

  await fetchAndProcessEvents();
}

// ─── Cron Job ─────────────────────────────────────────────────────────────────

export function startSeatGeekCron() {
  job = cron.schedule(CRON_EXPRESSION, async () => {
    if (errorCounter.hasExceededLimit()) {
      errorLogger.error(
        `[Cron] Too many consecutive errors (${errorCounter.count}). Stopping SeatGeek cron.`,
      );
      stopJob();
      return;
    }

    try {
      await processSeatGeekData();
      errorCounter.reset();
      debugLog(`[Cron] Run completed successfully.`);
    } catch (error) {
      errorCounter.increment();
      errorLogger.error('[Cron] Error during SeatGeek sync:', error);
      debugLog(`[Cron] Error #%d: %O`, errorCounter.count, error);
    }
  });

  debugLog(`[Cron] SeatGeek cron scheduled: "${CRON_EXPRESSION}"`);

  return stopJob;
}
