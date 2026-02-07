import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { prisma } from '../../../utils/db';
import type {
  TCalenderOAuth2CallbackArgs,
  TGetEventsArgs,
  TGetUserCalenderArgs,
} from './Calendar.interface';
import { googleAuth, GoogleTokenEncryption } from './Calendar.utils';
import { type calendar_v3, google } from 'googleapis';

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

      //? Get tokens from Google oAuth2
      const { tokens } = await googleAuth.getToken(code);

      //? Set Google Auth credentials
      googleAuth.setCredentials(tokens);

      const calendar = google.calendar({ version: 'v3', auth: googleAuth });

      const response = await calendar.calendarList.list();
      const primaryCalendar = response.data.items?.find(
        cal => cal.primary === true,
      );

      //? mark as connected
      await tx.calendar.update({
        where: { id: calendar_id },
        data: {
          connected_at: new Date(),
          is_connected: true,
          google_calender_id: primaryCalendar?.id,
        },
        select: { id: true },
      });

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

  async getEvents({
    end_date_time,
    start_date_time,
    user_id,
    limit,
  }: TGetEventsArgs) {
    const calender = await prisma.calendar.findUnique({
      where: { user_id },
      select: { calender_tokens: true, id: true },
    });

    if (!calender?.calender_tokens) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'Calendar is not connected.',
      );
    }

    //? Set Google Auth credentials
    googleAuth.setCredentials({
      access_token: calender.calender_tokens.access_token,
      refresh_token: calender.calender_tokens.refresh_token
        ? GoogleTokenEncryption.decrypt(calender.calender_tokens.refresh_token)
        : null,
      expiry_date: calender.calender_tokens.expire_at
        ? calender.calender_tokens.expire_at.getTime()
        : null,
      id_token: calender.calender_tokens.id_token ?? null,
      scope: calender.calender_tokens.scope ?? '',
      token_type: calender.calender_tokens.token_type ?? null,
    });

    googleAuth.on('tokens', async tokens => {
      if (tokens.refresh_token) {
        await prisma.calenderToken.update({
          where: { calendar_id: calender.id },
          data: {
            refresh_token: GoogleTokenEncryption.encrypt(tokens.refresh_token),
          },
        });
      }

      await prisma.calenderToken.update({
        where: { calendar_id: calender.id },
        data: {
          access_token: tokens.access_token,
          expire_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });
    });

    const calendar = google.calendar({ version: 'v3', auth: googleAuth });

    const queryParams: calendar_v3.Params$Resource$Events$List = {
      calendarId: 'primary',
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: limit,
    };

    queryParams.timeMin = start_date_time ?? new Date().toISOString();

    if (end_date_time) {
      queryParams.timeMax = end_date_time;
    }

    const response = await calendar.events.list(queryParams);

    const events = response.data.items ?? [];

    return events;
  },
};
