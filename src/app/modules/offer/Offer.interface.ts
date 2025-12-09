import type z from 'zod';
import type { OfferValidations } from './Offer.validation';
import type { User as TUser } from '../../../utils/db';

export type TCreateOfferArgs = z.infer<
  typeof OfferValidations.createOffer
>['body'] & { user: Pick<TUser, 'id' | 'role'> };

export type TOfferDetailsArgs = {
  offer_id: string;
  user: Pick<TUser, 'role'>;
};
