import { Router } from 'express';
import auth from '../app/middlewares/auth';
import { AdminRoutes } from '../app/modules/admin/Admin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { UserRoutes } from '../app/modules/user/User.route';
import { injectRoutes } from '../utils/router/injectRouter';
import { ArtistRoutes } from '../app/modules/artist/Artist.route';
import { AgentRoutes } from '../app/modules/agent/Agent.route';
import { VenueRoutes } from '../app/modules/venue/Venue.route';
import { ChatRoutes } from '../app/modules/chat/Chat.route';
import { MessageRoutes } from '../app/modules/message/Message.route';
import { OrganizerRoutes } from '../app/modules/organizer/Organizer.route';
import { PaymentRoutes } from '../app/modules/payment/Payment.route';
import { TicketRoutes } from '../app/modules/ticket/Ticket.route';
import { EventRoutes } from '../app/modules/event/Event.route';
import { BlogRoutes } from '../app/modules/blog/Blog.route';
import capture from '../app/middlewares/capture';
import catchAsync from '../app/middlewares/catchAsync';
import { SubscriptionRoutes } from '../app/modules/subscription/Subscription.route';
import { TransactionRoutes } from '../app/modules/transaction/Transaction.route';
import { MailRoutes } from '../app/modules/mail/Mail.route';
import { OfferRoutes } from '../app/modules/offer/Offer.route';
import { CalendarRoutes } from '../app/modules/calendar/Calendar.route';
import { OfferpostRoutes } from '../app/modules/offerpost/Offerpost.route';
import { ContextPageRoutes } from '../app/modules/contextPage/ContextPage.route';
import { SystemEventRoutes } from '../app/modules/systemEvent/SystemEvent.route';
import { SystemVenueRoutes } from '../app/modules/systemVenue/SystemVenue.route';
import { SystemPerformerRoutes } from '../app/modules/systemPerformer/SystemPerformer.route';
import { OfferRequestRoutes } from '../app/modules/offerRequest/OfferRequest.route';

const appRouter = Router();

//? Media upload endpoint
appRouter.post(
  '/upload-media',
  auth.all,
  capture({
    images: {
      size: 15 * 1024 * 1024,
      maxCount: 10,
      fileType: 'images',
    },
    videos: {
      size: 100 * 1024 * 1024,
      maxCount: 10,
      fileType: 'videos',
    },
  }),
  catchAsync(({ body }) => {
    return {
      message: 'Media uploaded successfully!',
      data: body,
    };
  }),
);

export default injectRoutes(appRouter, {
  // no auth required

  '/context-pages': [ContextPageRoutes.user],
  '/auth': [AuthRoutes.free],
  '/events': [EventRoutes.free],
  '/artists': [ArtistRoutes.free],
  '/agents': [AgentRoutes.free],
  '/venues': [VenueRoutes.free],
  '/payments': [PaymentRoutes.free],
  '/calendars': [CalendarRoutes],
  '/blogs': [BlogRoutes.free],
  '/mails': [MailRoutes.free],
  '/subscriptions': [SubscriptionRoutes.free],
  '/offer-posts': [OfferpostRoutes],
  '/system-events': [SystemEventRoutes],
  '/system-venues': [SystemVenueRoutes],
  '/system-performers': [SystemPerformerRoutes],
  '/offer-request': [OfferRequestRoutes.free],

  // all user can access
  '/profile': [auth.default, UserRoutes.all],
  '/tickets': [auth.all, TicketRoutes.all],
  '/transactions': [auth.all, TransactionRoutes.all],
  '/inbox': [auth.all, ChatRoutes.all],
  '/messages': [auth.all, MessageRoutes.all],
  '/offers': [auth.allOmitUser, OfferRoutes.all],

  // venue can access
  '/venue': [auth.venue, VenueRoutes.venue],

  // agent can access
  '/agent': [auth.agent, AgentRoutes.agent],

  // artist can access
  '/artist': [auth.artist, ArtistRoutes.artist],

  //organizer can access
  '/organizer': [auth.organizer, OrganizerRoutes.organizer],

  // only admin can access
  '/admin': [auth.admin, AdminRoutes.admin],
});
