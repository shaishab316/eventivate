import type { z } from 'zod';
import type { SystemVenueValidations } from './SystemVenue.validation';

export type TSearchSystemVenues = z.infer<
  typeof SystemVenueValidations.searchVenues
>;

export type TSearchSystemVenuesPayload = TSearchSystemVenues['query'];
