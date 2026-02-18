import z from 'zod';
import { exists } from '../../../utils/db/exists';

/**
 * Shared validation utils
 */
const _ = {
  location_lat: z.coerce
    .number('Location latitude is required')
    .min(-90, 'Location latitude must be at least -90')
    .max(90, 'Location latitude must be at most 90'),

  location_lng: z.coerce
    .number('Location longitude is required')
    .min(-180, 'Location longitude must be at least -180')
    .max(180, 'Location longitude must be at most 180'),

  genres: z
    .string()
    .trim()
    .transform(str =>
      str
        .split(',')
        .map(g => g.trim())
        .filter(Boolean),
    )
    .optional(),

  filter_date: z.iso.datetime().transform(str => {
    const date = new Date(str);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }),

  radius: z.coerce.number().min(0, 'Radius must be at least 0 km'),
};

/**
 * Validation for artist
 */
export const ArtistValidations = {
  /**
   * Validation schema for invite agent
   */
  inviteAgent: z.object({
    body: z.object({
      agent_id: z.string().refine(exists('user'), {
        error: ({ input }) => `Agent not found with id: ${input}`,
        path: ['agent_id'],
      }),
    }),
  }),

  /**
   * Validation schema for delete agent
   */
  deleteAgent: z.object({
    body: z.object({
      agent_id: z.string().refine(exists('user'), {
        error: ({ input }) => `Agent not found with id: ${input}`,
        path: ['agent_id'],
      }),
    }),
  }),

  /**
   * Validation schema for process artist request
   */
  processArtistRequest: z.object({
    body: z.object({
      agent_id: z.string().refine(exists('user'), {
        error: ({ input }) => `Agent not found with id: ${input}`,
        path: ['agent_id'],
      }),
    }),
  }),

  /**
   * Validation schema for search artists
   */
  searchArtists: z.object({
    query: z.object({
      genres: _.genres,
      location_lat: _.location_lat.optional(),
      location_lng: _.location_lng.optional(),
      start_date: _.filter_date.optional(),
      end_date: _.filter_date.optional(),
      radius: _.radius.default(100), //? default radius for search artists is 100 km
    }),
  }),
};
