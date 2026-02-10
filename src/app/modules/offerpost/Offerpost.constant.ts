import type { OfferpostGig as TOfferpostGig } from '../../../utils/db/index';

export const offerpostSearchableFields = [
  'genre',
  'title',
  'description',
  'location',
] as const satisfies Array<keyof TOfferpostGig>;
