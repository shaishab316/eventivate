import { Router } from 'express';
import { EventControllers } from './Event.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { EventValidations } from './Event.validation';
import capture from '../../middlewares/capture';
import { QueryValidations } from '../query/Query.validation';
import auth from '../../middlewares/auth';

const organizer = Router();
{
  /**
   * get organizer events
   */
  organizer.get(
    '/',
    purifyRequest(QueryValidations.list, EventValidations.getOrganizerEvent),
    EventControllers.getOrganizerEvents,
  );

  /**
   * Create new event
   */
  organizer.post(
    '/create-event',
    capture({
      images: {
        size: 15 * 1024 * 1024,
        maxCount: 10,
        fileType: 'images',
      },
    }),
    purifyRequest(EventValidations.createEvent),
    EventControllers.createEvent,
  );

  /**
   * Update event
   */
  organizer.post(
    '/update-event',
    capture({
      images: {
        size: 15 * 1024 * 1024,
        maxCount: 10,
        fileType: 'images',
      },
    }),
    purifyRequest(EventValidations.updateEvent),
    EventControllers.updateEvent,
  );

  /**
   * Complete event
   */
  organizer.post(
    '/complete-event',
    purifyRequest(EventValidations.completeEvent),
    EventControllers.completeEvent,
  );
}

const free = Router();
{
  /**
   * get all available events for users
   */
  free.get(
    '/',
    purifyRequest(QueryValidations.list),
    EventControllers.getAllEvents,
  );

  /**
   * Get all upcoming events
   */
  free.get(
    '/upcoming-events',
    auth.all,
    purifyRequest(QueryValidations.list),
    EventControllers.getUserUpcomingEvents,
  );

  /**
   * Get event by id
   */
  free.get(
    '/:event_id',
    purifyRequest(QueryValidations.exists('event_id', 'event')),
    EventControllers.getEventById,
  );
}

export const EventRoutes = {
  /**
   * Only organizer can access
   *
   * @url : (base_url)/organizer/events/
   */
  organizer,

  /**
   * All can access
   *
   * @url : (base_url)/events/
   */
  free,
};
