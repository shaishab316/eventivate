import { OfferRequest } from '../../../utils/db';

const order_by_fields = [
  'id',
  'created_at',
  'date',
] as const satisfies ReadonlyArray<keyof OfferRequest>;

const searchable_fields = [
  'name',
  'email',
  'phone',
  'artist_name',
  'venue_name',
  'system_performer_id',
  'system_venue_id',
] as const satisfies ReadonlyArray<keyof OfferRequest>;

export const OfferRequestConstants = {
  order_by_fields,
  searchable_fields,
};
