import { Router } from 'express';
import { OfferRequestControllers } from './OfferRequest.controller';
import { OfferRequestValidations } from './OfferRequest.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import auth from '../../middlewares/auth';

const router = Router();

/**
 * Get all offer requests for admin - Only admin can access
 */
router.get(
  '/',
  auth.admin,
  purifyRequest(OfferRequestValidations.getAllRequests),
  OfferRequestControllers.getAllRequestsForAdmin,
);

/**
 * Send offer request - Everyone can access
 */
router.post(
  '/send',
  auth.all,
  purifyRequest(OfferRequestValidations.send),
  OfferRequestControllers.send,
);

export const OfferRequestRoutes = router;
