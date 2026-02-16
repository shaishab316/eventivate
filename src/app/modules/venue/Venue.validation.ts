import z from 'zod';
import type { TModelZod } from '../../../types/zod';
import {
  EUserRole,
  EVenueOfferStatus,
  type User as TUser,
  type VenueOffer as TVenueOffer,
} from '../../../utils/db';
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

  venue_types: z
    .string()
    .trim()
    .transform(str => str.split(',').map(t => t.trim()))
    .optional(),

  filter_date: z.iso.datetime().transform(str => {
    const date = new Date(str);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }),
};

/**
 * Validation for venue
 */
export const VenueValidations = {
  /**
   * Validation schema for update venue
   */
  updateVenue: z.object({
    body: z.object({
      name: z.string().optional(),
      email: z.email().optional(),
      location: z.string().optional(),
      capacity: z.coerce.number().optional(),
      venue_type: z.string().optional(),
      price: z.coerce.string().optional(),
    } satisfies TModelZod<TUser>),
  }),

  /**
   * Validation schema for create agent offer
   */
  createOffer: z.object({
    body: z.object({
      amount: z.coerce.number({ error: 'Amount is required' }),
      start_date: z.iso.datetime({ error: 'Start date is required' }),
      end_date: z.iso.datetime().optional(),
      organizer_id: z
        .string()
        .refine(exists('user', { role: EUserRole.ORGANIZER }), {
          error: ({ input }) => `Organizer not found with id: ${input}`,
          path: ['organizer_id'],
        }),
    } satisfies TModelZod<TVenueOffer>),
  }),

  /**
   *
   */
  cancelOffer: z.object({
    body: z.object({
      offer_id: z.string().refine(exists('venueOffer'), {
        error: ({ input }) => `Offer not found with id: ${input}`,
        path: ['offer_id'],
      }),
    }),
  }),

  /**
   * Validation schema for get agent offers
   */
  getMyOffers: z.object({
    query: z.object({
      status: z.enum(EVenueOfferStatus).default(EVenueOfferStatus.PENDING),
    }),
  }),

  /**
   * Validation schema for search venues
   */
  searchVenues: z.object({
    query: z.object({
      venue_types: _.venue_types,
      min_capacity: z.coerce.number().optional(),
      max_capacity: z.coerce.number().optional(),
      location_lat: _.location_lat.optional(),
      location_lng: _.location_lng.optional(),
      start_date: _.filter_date.optional(),
      end_date: _.filter_date.optional(),
    }),
  }),
};
