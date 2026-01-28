import { prisma } from '../../../utils/db';
import type {
  TCalenderOAuth2CallbackArgs,
  TGetUserCalenderArgs,
} from './Calendar.interface';
import { googleAuth, GoogleTokenEncryption } from './Calendar.utils';

export const CalendarServices = {
  /**
   * Get or create user calendar
   */
  async getUserCalender({ user_id }: TGetUserCalenderArgs) {
    const calender = await prisma.calendar.upsert({
      where: { user_id },
      create: { user_id },
      update: {},
    });

    return calender;
  },

  /**
   * Get calendar by id
   */
  async getCalenderById(calendar_id: string) {
    const calender = await prisma.calendar.findUnique({
      where: { id: calendar_id },
    });

    return calender;
  },

  /**
   * Handle OAuth2 callback and store tokens securely
   */
  async oAuth2Callback({ code, state }: TCalenderOAuth2CallbackArgs) {
    return prisma.$transaction(async tx => {
      const calendar_id = GoogleTokenEncryption.decrypt(
        decodeURIComponent(state),
      );

      //? mark as connected
      await tx.calendar.update({
        where: { id: calendar_id },
        data: {
          connected_at: new Date(),
          is_connected: true,
        },
        select: { id: true },
      });

      //? Get tokens from Google oAuth2
      const { tokens } = await googleAuth.getToken(code);

      const tokenData = {
        access_token: tokens.access_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expire_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,

        /**
         * Encrypt refresh token before storing
         */
        refresh_token:
          tokens.refresh_token &&
          GoogleTokenEncryption.encrypt(tokens.refresh_token),
      };

      const calendarToken = await tx.calenderToken.upsert({
        where: { calendar_id },
        create: {
          calendar_id,
          ...tokenData,
        },
        update: tokenData,
        select: {
          access_token: true,
          expire_at: true,
        },
      });

      return calendarToken;
    });
  },
};
