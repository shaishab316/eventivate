import z from 'zod';
import { TModelZod } from '../../../types/zod';
import { Offer } from '../../../utils/db';

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
};
