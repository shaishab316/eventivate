import { EEventStatus, prisma } from '../../../utils/db';
import catchAsync from '../../middlewares/catchAsync';
import { EventServices } from './Event.service';

/**
 * All event related controllers
 */
export const EventControllers = {
  /**
   * Create new event
   */
  createEvent: catchAsync(async ({ body, user: organizer }) => {
    const event = await EventServices.createEvent({
      ...body,
      organizer_id: organizer.id,
    });

    return {
      message: 'Event created successfully!',
      data: event,
    };
  }),

  /**
   * Update event
   */
  updateEvent: catchAsync(async ({ body }) => {
    const event = await EventServices.updateEvent(body);

    return {
      message: 'Event updated successfully!',
      data: event,
    };
  }),

  /**
   * Get my upcoming events
   */
  getUserUpcomingEvents: catchAsync(async ({ query, user }) => {
    const { events, meta } = await EventServices.getUserUpcomingEvents({
      ...query,
      user_id: user.id,
    });

    return {
      message: 'Events retrieved successfully!',
      meta,
      data: events,
    };
  }),

  /**
   * Get organizer events
   */
  getOrganizerEvents: catchAsync(async ({ query, user: organizer }) => {
    const { events, meta } = await EventServices.getOrganizerEvents({
      ...query,
      organizer_id: organizer.id,
    });

    return {
      message: 'Events retrieved successfully!',
      meta,
      data: events,
    };
  }),

  getAllEvents: catchAsync(async ({ query }) => {
    const { events, meta } = await EventServices.getAllEvents(query);

    return {
      message: 'Events retrieved successfully!',
      meta,
      data: events,
    };
  }),

  completeEvent: catchAsync(async ({ body }) => {
    await prisma.event.update({
      where: { id: body.event_id },
      data: { status: EEventStatus.COMPLETED },
      select: { id: true },
    });

    return {
      message: 'Event completed successfully!',
    };
  }),

  /**
   * Get event by id
   */
  getEventById: catchAsync(async ({ params }) => {
    const event = await EventServices.getEventById(params.event_id);

    return {
      message: 'Event retrieved successfully!',
      data: event,
    };
  }),
};
