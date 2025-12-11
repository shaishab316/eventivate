import z from 'zod';
import { TModelZod } from '../../../types/zod';
import { EUserRole, Offer, Prisma } from '../../../utils/db';
import { exists } from '../../../utils/db/exists';
import type { SchemaOrFn } from '../../middlewares/purifyRequest';

export const OfferValidations = {
  createOffer: ({ user }) =>
    z.object({
      body: z.object({
        price: z.number({ error: 'Price must be provided' }),
        location: z.string({ error: 'Location must be provided' }),
        document: z.string({ error: 'Document must be provided' }),

        //? should be have a agent every offer
        ...(user.role !== EUserRole.AGENT && {
          agent_id: z.string().refine(
            exists('user', {
              role: EUserRole.AGENT,
            } satisfies Prisma.UserWhereInput),
            {
              error: ({ input }) =>
                `Agent with ID ${input} does not exist or is not an agent`,
            },
          ),
        }),
      } satisfies TModelZod<Offer, 'document'>),
    }),

  getAllOffers: z.object({
    query: z.object({
      tab: z.enum(['pending', 'accepted', 'completed']).default('accepted'),
    } satisfies TModelZod<Offer, 'tab'>),
  }),

  acceptOffer: ({ user }) =>
    z.object({
      body: z.object({
        offer_id: z.string().refine(
          exists('offer', {
            //? sure that the user can only accept their own offers
            [`${user.role.toLocaleLowerCase()}_id`]: user.id,
          }),
          {
            error: ({ input }) =>
              `Offer with ID ${input} does not exist or you do not have permission to accept it`,
          },
        ),
        document: z.string({ error: 'Document must be provided' }),
      }),
    }),

  assignOffer: ({ user }) =>
    z.object({
      body: z.object({
        offer_id: z.string().refine(
          exists('offer', {
            agent_id: user.id,
          } satisfies Prisma.OfferWhereInput),
        ),

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
  markAsComplete: ({ user }) =>
    z.object({
      body: z.object({
        offer_id: z.string().refine(
          exists('offer', {
            agent_id: user.id,
          } satisfies Prisma.OfferWhereInput),
        ),
      } satisfies TModelZod<Offer, 'offer_id'>),
    }),
} satisfies Record<string, SchemaOrFn>;
