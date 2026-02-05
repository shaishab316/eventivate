import type { z } from 'zod';
import type { VenueValidations } from './Venue.validation';
import { TList } from '../query/Query.interface';

/**
 * Type for update venue
 */
export type TUpdateVenueArgs = z.infer<
  typeof VenueValidations.updateVenue
>['body'] & { venue_id: string };

/**
 * Type for create agent offer
 */
export type TVenueCreateOfferArgs = z.infer<
  typeof VenueValidations.createOffer
>['body'] & { venue_id: string; end_date: string };

/**
 * Type for cancel agent offer
 */
export type TCancelVenueOfferArgs = z.infer<
  typeof VenueValidations.cancelOffer
>['body'] & {
  venue_id?: string;
  organizer_id?: string;
};

/**
 * @type: for get venue offers
 */
export type TGetVenueOffersArgs = TList &
  z.infer<typeof VenueValidations.getMyOffers>['query'] & {
    venue_id: string;
  };

/**
 * Type for search venues
 */
export type TSearchVenuesQuery = z.infer<
  typeof VenueValidations.searchVenues
>['query'] &
  TList;

export type TSearchVenues = {
  query: TSearchVenuesQuery;
};

export type TSearchVenuesPayload = TSearchVenuesQuery;
