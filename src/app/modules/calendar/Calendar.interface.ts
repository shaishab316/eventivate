import type { z } from 'zod';
import type { CalendarValidations } from './Calendar.validation';

export type TCalenderOAuth2CallbackQuery = z.infer<
  typeof CalendarValidations.oAuth2Callback
>['query'];

export type TCalenderOAuth2Callback = {
  query: TCalenderOAuth2CallbackQuery;
};

export type TCalenderOAuth2CallbackArgs = TCalenderOAuth2CallbackQuery;

export type TGetUserCalenderArgs = {
  user_id: string;
};

export type TGetEventsQuery = z.infer<
  typeof CalendarValidations.getEvents
>['query'];

export type TGetEvents = {
  query: TGetEventsQuery;
};

export type TGetEventsArgs = TGetEventsQuery & {
  user_id: string;
};
