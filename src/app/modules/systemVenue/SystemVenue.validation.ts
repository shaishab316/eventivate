import z from 'zod';
import { SystemSource } from '../../../utils/db';

export const SystemVenueValidations = {
  searchVenues: z.object({
    query: z.object({
      location_lat: z.coerce
        .number('Latitude must be a number')
        .min(-90, 'Latitude must be greater than or equal to -90')
        .max(90, 'Latitude must be less than or equal to 90')
        .optional(),
      location_lng: z.coerce
        .number('Longitude must be a number')
        .min(-180, 'Longitude must be greater than or equal to -180')
        .max(180, 'Longitude must be less than or equal to 180')
        .optional(),
      radius_mi: z.coerce
        .number('Radius must be a number')
        .min(0, 'Radius must be greater than or equal to 0')
        .max(100000, 'Radius must be less than or equal to 100000')
        .default(1000),

      search: z
        .string()
        .trim()
        .max(255, 'Search query must be at most 255 characters long')
        .optional(),

      // date_start: z.iso.date().optional(),
      // date_end: z.iso.date().optional(),

      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100, 'Limit must be less than or equal to 100')
        .default(20),
    }),
  }),

  createVenue: z.object({
    body: z.object({
      name: z
        .string()
        .trim()
        .max(255, 'Name must be at most 255 characters long'),

      address: z
        .string()
        .trim()
        .max(255, 'Address must be at most 255 characters long')
        .optional(),
      city: z
        .string()
        .trim()
        .max(255, 'City must be at most 255 characters long')
        .optional(),
      state: z
        .string()
        .trim()
        .max(255, 'State must be at most 255 characters long')
        .optional(),
      country: z
        .string()
        .trim()
        .max(255, 'Country must be at most 255 characters long')
        .optional(),
      zip: z
        .string()
        .trim()
        .max(20, 'Zip code must be at most 20 characters long')
        .optional(),
      location_lat: z.coerce
        .number('Latitude must be a number')
        .min(-90, 'Latitude must be greater than or equal to -90')
        .max(90, 'Latitude must be less than or equal to 90')
        .optional(),
      location_lng: z.coerce
        .number('Longitude must be a number')
        .min(-180, 'Longitude must be greater than or equal to -180')
        .max(180, 'Longitude must be less than or equal to 180')
        .optional(),

      capacity: z.coerce
        .number()
        .int()
        .min(0, 'Capacity must be greater than or equal to 0')
        .optional(),

      score: z.coerce
        .number()
        .min(0, 'Score must be greater than or equal to 0')
        .max(10, 'Score must be less than or equal to 10')
        .optional(),

      image_url: z.string().optional(),

      source: z
        .literal(SystemSource.ADMIN_CREATED)
        .default(SystemSource.ADMIN_CREATED),
    }),
  }),
};
