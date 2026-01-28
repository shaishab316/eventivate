import catchAsync from '../../middlewares/catchAsync';
import { calendarScopes } from './Calendar.constant';
import type { TCalenderOAuth2Callback } from './Calendar.interface';
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
};
