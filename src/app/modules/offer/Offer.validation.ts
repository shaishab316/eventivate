import z from 'zod';
import { TModelZod } from '../../../types/zod';
import { Offer } from '../../../utils/db';
import { exists } from '../../../utils/db/exists';
import type { SchemaOrFn } from '../../middlewares/purifyRequest';

export const OfferValidations = {
  createOffer: z.object({
    body: z.object({
      price: z.number({ error: 'Price must be provided' }),
      location: z.string({ error: 'Location must be provided' }),
      document: z.string({ error: 'Document must be provided' }),
    } satisfies TModelZod<Offer, 'document'>),
  }),

  getAllOffers: z.object({
    query: z.object({
      is_fully_accepted: z
        .string()
        .transform(val => val === 'true')
        .optional(),
    } satisfies TModelZod<Offer>),
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
} satisfies Record<string, SchemaOrFn>;
