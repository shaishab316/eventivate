process.stdout.write('\x1Bc'); //? clear console
import startServer from './utils/server/startServer';
import { SocketServices } from './app/modules/socket/Socket.service';
import { eventPublishingJob } from './app/modules/event/Event.job';
import { ticketExpirationJob } from './app/modules/ticket/Ticket.job';
import { subscriptionExpireJob } from './app/modules/subscription/Subscription.job';
import { startSeatGeekCron } from './app/modules/seatGeek/SeatGeek.cron';

/**
 * server initialization
 */
const server = await startServer();

/**
 * Add plugins to the server
 */
server.addPlugins(
  startSeatGeekCron(),
  SocketServices.init(server),
  eventPublishingJob(),
  ticketExpirationJob(),
  subscriptionExpireJob(),
);
