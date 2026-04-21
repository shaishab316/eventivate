import cron, { ScheduledTask } from 'node-cron';
import { errorLogger } from '../../../utils/logger';
import { SeatGeekServices } from './SeatGeek.service';

let job: ScheduledTask | null = null;

const CRON_EXPRESSION = '0 2 * * *'; // production: every night at 2am
// const CRON_EXPRESSION = '*/1 * * * *'; // testing: every minute
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
      await SeatGeekServices.runFullSync();
      errorCounter.reset();
      console.log(`[Cron] Sync completed successfully.`);
    } catch (error) {
      errorCounter.increment();
      errorLogger.error('[Cron] Error during SeatGeek sync:', error);
      console.error(`[Cron] Error #%d: %O`, errorCounter.count, error);
    }
  });

  console.log(`[Cron] SeatGeek cron scheduled: "${CRON_EXPRESSION}"`);

  return stopJob;
}
