import z from 'zod';
import { TModelZod } from '../../../types/zod';
import { OfferpostGig } from '../../../utils/db';
import { exists } from '../../../utils/db/exists';

/**
 * Shared validations for Offerpost module
 */
const _ = {
  genre: z.string('Genre must be a string').trim(),

  title: z
    .string('Title must be a string')
    .trim()
    .min(1, 'Title is required')
    .max(500, 'Title must be at most 500 characters'),

  description: z
    .string('Description must be a string')
    .trim()
    .min(1, 'Description is required')
    .max(5000, 'Description must be at most 5000 characters'),

  banner_url: z.string(),

  keywords: z.array(z.string().trim()),

  location: z
    .string('Location is required')
    .trim()
    .min(1, 'Location is required'),

  location_lat: z.coerce
    .number('Location latitude is required')
    .min(-90, 'Location latitude must be at least -90')
    .max(90, 'Location latitude must be at most 90'),

  location_lng: z.coerce
    .number('Location longitude is required')
    .min(-180, 'Location longitude must be at least -180')
    .max(180, 'Location longitude must be at most 180'),

  budget: (kind = '') =>
    z.coerce.number().min(0, `${kind} budget must be at least 0`),

  boolean: z.boolean(),

  gig_id: z.string('Gig ID must be a string').refine(exists('offerpostGig'), {
    error: ({ input }) => `Gig with ID "${input}" does not exist`,
  }),
};

export const OfferpostValidations = {
  createGig: z.object({
    body: z.object({
      // if artist
      genre: _.genre.optional(),
      title: _.title,
      description: _.description,
      banner_url: _.banner_url.optional(),
      keywords: _.keywords.optional(),
      location: _.location.optional(),
      location_lat: _.location_lat.optional(),
      location_lng: _.location_lng.optional(),
      budget_max: _.budget('Maximum').optional(),
      budget_min: _.budget('Minimum').optional(),
      target_for_agents: _.boolean.optional(),
      target_for_artists: _.boolean.optional(),
      target_for_managers: _.boolean.optional(),
      target_for_organizers: _.boolean.optional(),
      target_for_venues: _.boolean.optional(),
      is_active: _.boolean.optional(),
    } satisfies TModelZod<OfferpostGig>),
  }),

  updateGig: z.object({
    body: z.object({
      gig_id: _.gig_id,

      // if artist
      genre: _.genre.optional(),
      title: _.title.optional(),
      description: _.description.optional(),
      banner_url: _.banner_url.optional(),
      keywords: _.keywords.optional(),
      location: _.location.optional(),
      location_lat: _.location_lat.optional(),
      location_lng: _.location_lng.optional(),
      budget_max: _.budget('Maximum').optional(),
      budget_min: _.budget('Minimum').optional(),
      target_for_agents: _.boolean.optional(),
      target_for_artists: _.boolean.optional(),
      target_for_managers: _.boolean.optional(),
      target_for_organizers: _.boolean.optional(),
      target_for_venues: _.boolean.optional(),
      is_active: _.boolean.optional(),
    } satisfies Partial<TModelZod<OfferpostGig, 'gig_id'>>),
  }),

  deleteGig: z.object({
    body: z.object({
      gig_id: _.gig_id,
    }),
  }),
};
