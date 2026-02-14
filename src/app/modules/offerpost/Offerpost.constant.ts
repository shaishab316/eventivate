import type { OfferpostGig as TOfferpostGig } from '../../../utils/db/index';

/**
 * Fields that can be used for searching gigs. This is used in the searchOtherGigs endpoint, and is also used to determine which fields to calculate text search vectors for in the database.
 */
export const offerpostGigSearchableFields = [
  'genre',
  'title',
  'description',
  'location',
] as const satisfies Array<keyof TOfferpostGig>;
