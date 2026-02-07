import { prisma } from '../../../utils/db';
import { errorLogger } from '../../../utils/logger';
import catchAsync from '../../middlewares/catchAsync';
import { calendarScopes } from './Calendar.constant';
import type { TGetEvents, TCalenderOAuth2Callback } from './Calendar.interface';
import { CalendarServices } from './Calendar.service';
import { googleAuth, GoogleTokenEncryption } from './Calendar.utils';

export const CalendarControllers = {
  /**
   * Generate Google OAuth2 Auth URL
   */
  generateAuthUrl: catchAsync(async ({ user }) => {
    const calender = await CalendarServices.getUserCalender({
      user_id: user.id,
    });

    const url = googleAuth.generateAuthUrl({
      access_type: 'offline',
      scope: calendarScopes,
      prompt: 'consent',

      /**
       * Encrypt calender id to identify user in callback
       */
      state: encodeURIComponent(GoogleTokenEncryption.encrypt(calender.id)),
    });

    return {
      message: 'Auth URL generated successfully',
      data: { url },
    };
  }),

  /**
   * Handle OAuth2 callback
   */
  oAuth2Callback: catchAsync<TCalenderOAuth2Callback>(async ({ query }) => {
    const data = await CalendarServices.oAuth2Callback(query);

    return {
      message: 'Calendar connected successfully',
      data,
    };
  }),

  /**
   * Get my events
   */
  getEvents: catchAsync<TGetEvents>(async ({ query, user }) => {
    try {
      const events = await CalendarServices.getEvents({
        ...query,
        user_id: query.user_id ?? user.id,
      });

      return {
        message: query.user_id
          ? 'User events fetched successfully'
          : 'My events fetched successfully',
        meta: {
          is_connected: true,
        },
        data: events,
      };
    } catch (error) {
      if (error instanceof Error) {
        errorLogger.error('Failed to fetch Google Calendar events', {
          userId: user.id,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        });
      }

      await prisma.calendar.updateMany({
        where: { user_id: user.id },
        data: { is_connected: false, disconnected_at: new Date() },
      });

      return {
        message:
          'Failed to fetch events. Please ensure your calendar is connected.',
        meta: {
          is_connected: false,
        },
        data: [],
      };
    }
  }),
};
