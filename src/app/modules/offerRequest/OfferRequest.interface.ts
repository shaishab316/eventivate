import z from 'zod';
import { OfferRequestValidations } from './OfferRequest.validation';

export type TOfferRequestSendController = z.infer<
  typeof OfferRequestValidations.send
>;

export type TOfferRequestSendService = TOfferRequestSendController['body'] & {
  user_id: string;
};

export type TOfferRequestGetAllController = z.infer<
  typeof OfferRequestValidations.getAllRequests
>;

export type TOfferRequestGetAllService = TOfferRequestGetAllController['query'];

export type TOfferRequestGetMyRequestsController = z.infer<
  typeof OfferRequestValidations.getMyRequests
>;

export type TOfferRequestGetMyRequestsService =
  TOfferRequestGetMyRequestsController['query'] & {
    user_id: string;
  };
