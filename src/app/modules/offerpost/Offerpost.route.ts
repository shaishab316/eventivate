import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { OfferpostControllers } from './Offerpost.controller';
import { OfferpostValidations } from './Offerpost.validation';
import auth from '../../middlewares/auth';
import capture from '../../middlewares/capture';
import { QueryValidations } from '../query/Query.validation';

const router = Router();

/**
 * Get the authenticated user's offerposts, with optional filtering by status (default: PENDING).
 */
router.get(
  '/',
  auth.all,
  purifyRequest(QueryValidations.list, OfferpostValidations.getMyOfferposts),
  OfferpostControllers.getMyOfferposts,
);

/**
 * Create a new offerpost gig. This endpoint is for creating gigs that the user owns. To request to join an existing gig, use the /gig-requests endpoint.
 */
router.post('/', auth.all, OfferpostControllers.createOfferpost);

/**
 * Update an offerpost. Only the owner of the offerpost can perform this action.
 */
router.patch(
  '/',
  auth.all,
  capture({
    attachment_url: {
      fileType: 'any',
      size: 100 * 1024 * 1024, // 100MB
      maxCount: 1,
    },
  }),
  purifyRequest(OfferpostValidations.updateOfferpost),
  OfferpostControllers.updateOfferpost,
);

/**
 * Leave (delete) an offerpost. Only the owner of the offerpost can perform this action. If the user is the only member left in the offerpost or is the owner, deleting the offerpost entirely would make more sense than leaving it empty, so we delete the offerpost in this case. If there are other members in the offerpost, we simply remove the user from the members list (and admins list if they are an admin) to allow the offerpost to continue existing for the remaining members.
 */
router.delete(
  '/',
  auth.all,
  purifyRequest(OfferpostValidations.leaveFromOfferpost),
  OfferpostControllers.leaveFromOfferpost,
);

router.get(
  '/my-gigs',
  auth.all,
  purifyRequest(QueryValidations.list),
  OfferpostControllers.getMyGigs,
);

/**
 * Search for gigs to join. This searches all gigs that the user does not own, with optional filtering by status (default: PENDING) and text search on the gig's title, description, genre, and location.
 */
router.get(
  '/search-gigs',
  auth.all,
  purifyRequest(QueryValidations.list, OfferpostValidations.searchOtherGigs),
  OfferpostControllers.searchOtherGigs,
);

/**
 * Get details of a specific gig, including its offerpost and members. This is used when viewing a gig's details, either from the search results or from the user's own gigs. The user must be a member of the offerpost to view the gig details, unless the gig is still PENDING, in which case anyone can view the details to allow them to decide whether to request to join.
 */
router.get(
  '/gig-details',
  auth.all,
  purifyRequest(OfferpostValidations.getGigDetails),
  OfferpostControllers.getGigDetails,
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

/**
 * Cancel a gig request. This sets the OfferpostGigRequest's status to CANCELLED. Only the requester can cancel their gig request, and only if it's still PENDING.
 */
router.post(
  '/cancel-gig-requests',
  auth.all,
  purifyRequest(OfferpostValidations.cancelGigRequest),
  OfferpostControllers.cancelGigRequest,
);

/**
 * Accept a gig request. This sets the OfferpostGigRequest's status to ACCEPTED. Only the gig owner can accept a gig request, and only if it's still PENDING.
 */
router.post(
  '/accept-gig-requests',
  auth.all,
  purifyRequest(OfferpostValidations.acceptGigRequest),
  OfferpostControllers.acceptGigRequest,
);

export const OfferpostRoutes = router;
