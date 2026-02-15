import z from 'zod';
import { TModelZod } from '../../../types/zod';
import { EUserRole, Offer, Prisma } from '../../../utils/db';
import { exists } from '../../../utils/db/exists';

export const OfferValidations = {
  createOffer: z.object({
    body: z.object({
      price: z.number({ error: 'Price must be provided' }),
      location: z.string({ error: 'Location must be provided' }),
      document: z.string({ error: 'Document must be provided' }),
      date: z.iso.datetime({ error: 'Date must be provided' }),

      agent_id: z.string().refine(
        exists('user', {
          role: EUserRole.AGENT,
        } satisfies Prisma.UserWhereInput),
        {
          error: ({ input }) =>
            `Agent with ID ${input} does not exist or is not an agent`,
        },
      ),
    } satisfies TModelZod<Offer, 'document'>),
  }),

  getAllOffers: z.object({
    query: z.object({
      tab: z.enum(['pending', 'accepted', 'completed']).default('accepted'),
    } satisfies TModelZod<Offer, 'tab'>),
  }),

  acceptOffer: z.object({
    body: z.object({
      offer_id: z.string().refine(exists('offer'), {
        error: ({ input }) =>
          `Offer with ID ${input} does not exist or you do not have permission to accept it`,
      }),
      document: z.string({ error: 'Document must be provided' }),
    }),
  }),

  assignOffer: z.object({
    body: z.object({
      offer_id: z.string().refine(exists('offer')),

      venue_id: z
        .string()
        .refine(
          exists('user', {
            role: EUserRole.VENUE,
          } satisfies Prisma.UserWhereInput),
        )
        .optional(),
      artist_id: z
        .string()
        .refine(
          exists('user', {
            role: EUserRole.ARTIST,
          } satisfies Prisma.UserWhereInput),
        )
        .optional(),
      organizer_id: z
        .string()
        .refine(
          exists('user', {
            role: EUserRole.ORGANIZER,
          } satisfies Prisma.UserWhereInput),
        )
        .optional(),
    } satisfies TModelZod<Offer, 'offer_id'>),
  }),

  /**
   * Mark an offer as complete.
   */
  markAsComplete: z.object({
    body: z.object({
      offer_id: z.string().refine(exists('offer')),
    } satisfies TModelZod<Offer, 'offer_id'>),
  }),
};
