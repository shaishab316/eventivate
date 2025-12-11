import type z from 'zod';
import type { OfferValidations } from './Offer.validation';
import type { User as TUser } from '../../../utils/db';
import { TList } from '../query/Query.interface';

export type TCreateOfferArgs = z.infer<
  ReturnType<typeof OfferValidations.createOffer>
>['body'] & { user: Pick<TUser, 'id' | 'role'>; agent_id?: string };

export type TOfferDetailsArgs = {
  offer_id: string;
  user: Pick<TUser, 'role'>;
};

export type TGetAllOffersArgs = z.infer<
  typeof OfferValidations.getAllOffers
>['query'] & { user: Pick<TUser, 'id' | 'role'> } & TList;

export type TAcceptOfferArgs = z.infer<
  ReturnType<typeof OfferValidations.acceptOffer>
>['body'] & { user: Pick<TUser, 'id' | 'role'> };

export type TAssignOfferArgs = z.infer<
  ReturnType<typeof OfferValidations.assignOffer>
>['body'];

export type TMarkOfferAsCompleteArgs = z.infer<
  ReturnType<typeof OfferValidations.markAsComplete>
>['body'];
