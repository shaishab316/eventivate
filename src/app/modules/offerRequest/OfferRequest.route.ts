import { Router } from 'express';
import { OfferRequestControllers } from './OfferRequest.controller';
import { OfferRequestValidations } from './OfferRequest.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import auth from '../../middlewares/auth';

const free = Router();

/**
 * Send offer request - Everyone can access
 */
free.post(
  '/send',
  auth.all,
  purifyRequest(OfferRequestValidations.send),
  OfferRequestControllers.send,
);

export const OfferRequestRoutes = {
  /**
   * Everyone can access
   * @url : (base_url)/offer-request/
   */
  free,
};
