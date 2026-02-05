import { User as TUser } from '../../../utils/db';

export const venueSearchableFields = [
  'name',
  'email',
  'genre',
  'location',
  'id',
] as const satisfies (keyof TUser)[];
