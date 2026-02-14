import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { OfferpostControllers } from './Offerpost.controller';
import { OfferpostValidations } from './Offerpost.validation';
import auth from '../../middlewares/auth';
import capture from '../../middlewares/capture';
import { QueryValidations } from '../query/Query.validation';

const router = Router();

router.get(
  '/my-gigs',
  auth.all,
  purifyRequest(QueryValidations.list),
  OfferpostControllers.getMyGigs,
);

router.get(
  '/search-gigs',
  auth.all,
  purifyRequest(QueryValidations.list, OfferpostValidations.searchOtherGigs),
  OfferpostControllers.searchOtherGigs,
);

router.post(
  '/gigs',
  auth.all,
  capture({
    banner_url: {
      fileType: 'images',
      size: 15 * 1024 * 1024, // 15MB
      maxCount: 1,
    },
  }),
  purifyRequest(OfferpostValidations.createGig),
  OfferpostControllers.createGig,
);

router.patch(
  '/gigs',
  auth.all,
  capture({
    banner_url: {
      fileType: 'images',
      size: 15 * 1024 * 1024, // 15MB
      maxCount: 1,
    },
  }),
  purifyRequest(OfferpostValidations.updateGig),
  OfferpostControllers.updateGig,
);

router.delete(
  '/gigs',
  auth.all,
  purifyRequest(OfferpostValidations.deleteGig),
  OfferpostControllers.deleteGig,
);

/**
 * Request to join a gig. This creates an OfferpostGigRequest with status PENDING.
 */
router.post(
  '/gig-requests',
  auth.all,
  purifyRequest(OfferpostValidations.requestGig),
  OfferpostControllers.requestGig,
);

/**
 * Get the authenticated user's gig requests, with optional filtering by status (default: PENDING).
 * This returns all gig requests made by the user, regardless of the gig's owner.
 */
router.get(
  '/send-gig-requests',
  auth.all,
  purifyRequest(QueryValidations.list, OfferpostValidations.getSendGigRequests),
  OfferpostControllers.getSendGigRequests,
);

/**
 * Get gig requests received for the authenticated user's gigs, with optional filtering by status (default: PENDING).
 * This returns all gig requests for gigs owned by the user, regardless of who made the request.
 */
router.get(
  '/received-gig-requests',
  auth.all,
  purifyRequest(
    QueryValidations.list,
    OfferpostValidations.getReceivedGigRequests,
  ),
  OfferpostControllers.getReceivedGigRequests,
);

export const OfferpostRoutes = router;
