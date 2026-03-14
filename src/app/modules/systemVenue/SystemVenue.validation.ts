import z from 'zod';
import { SystemSource } from '../../../utils/db';

const validator = {
  name: z.string().trim().max(255, 'Name must be at most 255 characters long'),

  address: z
    .string()
    .trim()
    .max(255, 'Address must be at most 255 characters long'),
  city: z.string().trim().max(255, 'City must be at most 255 characters long'),
  state: z
    .string()
    .trim()
    .max(255, 'State must be at most 255 characters long'),
  country: z
    .string()
    .trim()
    .max(255, 'Country must be at most 255 characters long'),
  zip: z.string().trim().max(20, 'Zip code must be at most 20 characters long'),

  latitude: z.coerce
    .number('Latitude must be a number')
    .min(-90, 'Latitude must be greater than or equal to -90')
    .max(90, 'Latitude must be less than or equal to 90'),
  longitude: z.coerce
    .number('Longitude must be a number')
    .min(-180, 'Longitude must be greater than or equal to -180')
    .max(180, 'Longitude must be less than or equal to 180'),

  radius_mi: z.coerce
    .number('Radius must be a number')
    .min(0, 'Radius must be greater than or equal to 0')
    .max(100000, 'Radius must be less than or equal to 100000'),
  capacity: z.coerce
    .number()
    .int()
    .min(0, 'Capacity must be greater than or equal to 0'),

  score: z.coerce
    .number()
    .min(0, 'Score must be greater than or equal to 0')
    .max(10, 'Score must be less than or equal to 10'),

  image_url: z.string('Image is required').optional(),

  search: z
    .string()
    .trim()
    .max(255, 'Search query must be at most 255 characters long'),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100, 'Limit must be less than or equal to 100'),

  venue_id: z.string('Venue ID is required'),
};

export const SystemVenueValidations = {
  searchVenues: z.object({
    query: z.object({
      location_lat: validator.latitude.optional(),
      location_lng: validator.longitude.optional(),
      radius_mi: validator.radius_mi.default(1000),

      search: validator.search.optional(),

      // date_start: z.iso.date().optional(),
      // date_end: z.iso.date().optional(),

      page: validator.page,
      limit: validator.limit.default(20),
    }),
  }),

  createVenue: z.object({
    body: z.object({
      name: validator.name,
      image_url: validator.image_url.optional(),

      address: validator.address.optional(),
      city: validator.city.optional(),
      state: validator.state.optional(),
      country: validator.country.optional(),
      zip: validator.zip.optional(),
      latitude: validator.latitude.optional(),
      longitude: validator.longitude.optional(),

      capacity: validator.capacity.optional(),
      score: validator.score.optional(),

      source: z
        .literal(SystemSource.ADMIN_CREATED)
        .default(SystemSource.ADMIN_CREATED),
    }),
  }),

  updateVenue: z.object({
    body: z.object({
      venue_id: validator.venue_id,

      name: validator.name.optional(),
      image_url: validator.image_url.optional(),

      address: validator.address.optional(),
      city: validator.city.optional(),
      state: validator.state.optional(),
      country: validator.country.optional(),
      zip: validator.zip.optional(),
      latitude: validator.latitude.optional(),
      longitude: validator.longitude.optional(),

      capacity: validator.capacity.optional(),
      score: validator.score.optional(),
    }),
  }),
};
