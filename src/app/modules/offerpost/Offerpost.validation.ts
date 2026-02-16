import z from 'zod';
import { TModelZod } from '../../../types/zod';
import {
  EOfferpostGigRequestStatus,
  EOfferpostStatus,
  EUserRole,
  OfferpostGig as TOfferpostGig,
  Offerpost as TOfferpost,
} from '../../../utils/db';
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

  role: z.enum(EUserRole),

  genres: z.string().transform(s => s.split(',').map(g => g.trim())),

  search_keywords: z.string().transform(s => s.split(',').map(k => k.trim())),

  radius_km: z.coerce.number().min(0, 'Radius must be at least 0'),

  referenced_offerpost_id: z
    .string('Referenced Offerpost ID must be a string')
    .refine(exists('offerpostGig'), {
      error: ({ input }) =>
        `Referenced Offerpost with ID "${input}" does not exist`,
    }),

  message: z
    .string('Message must be a string')
    .trim()
    .max(5000, 'Message must be at most 5000 characters'),

  gig_request_status: z.enum(EOfferpostGigRequestStatus),

  gig_request_id: z
    .string('Gig request ID must be a string')
    .refine(exists('offerpostGigRequest'), {
      error: ({ input }) => `Gig request with ID "${input}" does not exist`,
    }),

  offerpost_status: z.enum(EOfferpostStatus),

  offerpost_id: z
    .string('Offerpost ID must be a string')
    .refine(exists('offerpost'), {
      error: ({ input }) => `Offerpost with ID "${input}" does not exist`,
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
    } satisfies TModelZod<TOfferpostGig>),
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
    } satisfies Partial<TModelZod<TOfferpostGig, 'gig_id'>>),
  }),

  deleteGig: z.object({
    body: z.object({
      gig_id: _.gig_id,
    }),
  }),

  searchOtherGigs: z.object({
    query: z.object({
      role: _.role.default(EUserRole.ARTIST),
      genres: _.genres.optional(),
      keywords: _.search_keywords.optional(),
      location_lat: _.location_lat.optional(),
      location_lng: _.location_lng.optional(),
      budget_max: _.budget('Maximum').optional(),
      budget_min: _.budget('Minimum').optional(),
      radius_km: _.radius_km.default(50),
    }),
  }),

  /**
   * Request to join a gig. This creates an OfferpostGigRequest with status PENDING.
   */
  requestGig: z.object({
    body: z.object({
      gig_id: _.gig_id,
      referenced_offerpost_id: _.referenced_offerpost_id.optional(),
      message: _.message,
    }),
  }),

  /**
   * Get the authenticated user's gig requests, with optional filtering by status (default: PENDING).
   */
  getSendGigRequests: z.object({
    query: z.object({
      status: _.gig_request_status.default('PENDING'),
    }),
  }),

  /**
   * Get the authenticated user's received gig requests, with optional filtering by status (default: PENDING).
   */
  getReceivedGigRequests: z.object({
    query: z.object({
      status: _.gig_request_status.default('PENDING'),
    }),
  }),

  /**
   * Reject or accept a gig request. Only the owner of the gig can perform this action.
   */
  cancelGigRequest: z.object({
    body: z.object({
      gig_request_id: _.gig_request_id,
      reject_reason: _.message.optional(),
    }),
  }),

  /**
   * Accept a gig request. This sets the OfferpostGigRequest's status to ACCEPTED. Only the gig owner can accept a gig request, and only if it's still PENDING.
   */
  acceptGigRequest: z.object({
    body: z.object({
      gig_request_id: _.gig_request_id,
    }),
  }),

  /**
   * Get the authenticated user's offerposts, with optional filtering by status (default: PENDING).
   */
  getMyOfferposts: z.object({
    query: z.object({
      status: _.offerpost_status.default('PENDING'),
    }),
  }),

  /**
   * Leave (delete) an offerpost. Only the owner of the offerpost can perform this action.
   */
  leaveFromOfferpost: z.object({
    body: z.object({
      offerpost_id: _.offerpost_id,
    }),
  }),

  /**
   * Update an offerpost. Only the owner of the offerpost can perform this action.
   */
  updateOfferpost: z.object({
    body: z.object({
      offerpost_id: _.offerpost_id,

      status: _.offerpost_status.optional(),
      attachment_url: z.string().optional(),

      /**
       * Todo: add more fields
       */
    } satisfies TModelZod<TOfferpost, 'offerpost_id'>),
  }),

  /**
   * Get details of a gig, including all its offerposts and gig requests. Only the gig owner and gig requesters can perform this action.
   */
  getGigDetails: z.object({
    query: z.object({
      gig_id: _.gig_id,
    }),
  }),
};
