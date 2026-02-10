import type { z } from 'zod';
import type { OfferpostValidations } from './Offerpost.validation';
import type { EUserRole } from '../../../utils/db';

export type TCreateGig = z.infer<typeof OfferpostValidations.createGig>;

export type TCreateGigPayload = TCreateGig['body'] & {
  owner_id: string;
  owner_role: EUserRole;
};

export type TUpdateGig = z.infer<typeof OfferpostValidations.updateGig>;

export type TUpdateGigPayload = TUpdateGig['body'] & {
  user_id: string;
};

export type TDeleteGig = z.infer<typeof OfferpostValidations.deleteGig>;

export type TDeleteGigPayload = TDeleteGig['body'] & {
  user_id: string;
};
