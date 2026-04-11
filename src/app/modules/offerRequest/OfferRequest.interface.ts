import z from 'zod';
import { OfferRequestValidations } from './OfferRequest.validation';

export type TOfferRequestSend = z.infer<
  typeof OfferRequestValidations.send
>['body'];
