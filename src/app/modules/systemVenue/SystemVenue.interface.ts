import type { z } from 'zod';
import type { SystemVenueValidations } from './SystemVenue.validation';

export type TSearchSystemVenues = z.infer<
  typeof SystemVenueValidations.searchVenues
>;

export type TSearchSystemVenuesPayload = TSearchSystemVenues['query'];

export type TCreateSystemVenue = z.infer<
  typeof SystemVenueValidations.createVenue
>;

export type TCreateSystemVenuePayload = TCreateSystemVenue['body'];

export type TUpdateSystemVenue = z.infer<
  typeof SystemVenueValidations.updateVenue
>;

export type TUpdateSystemVenuePayload = TUpdateSystemVenue['body'];
