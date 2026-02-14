import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import type {
  TCreateGig,
  TGetMyGigs,
  TGetReceivedGigRequests,
  TGetSendGigRequests,
  TRequestGig,
  TSearchOtherGigs,
  TUpdateGig,
} from './Offerpost.interface';
import { OfferpostServices } from './Offerpost.service';

export const OfferpostControllers = {
  createGig: catchAsync<TCreateGig>(async ({ user, body }) => {
    const newGig = await OfferpostServices.createGig({
      ...body,
      owner_id: user.id,
      owner_role: user.role,
    });

    return {
      statusCode: StatusCodes.CREATED,
      message: 'Gig created successfully',
      data: newGig,
    };
  }),

  updateGig: catchAsync<TUpdateGig>(async ({ user, body }) => {
    const updatedGig = await OfferpostServices.updateGig({
      ...body,
      user_id: user.id,
    });

    return {
      statusCode: StatusCodes.OK,
      message: 'Gig updated successfully',
      data: updatedGig,
    };
  }),

  deleteGig: catchAsync(async ({ user, body }) => {
    const deletedGig = await OfferpostServices.deleteGig({
      ...body,
      user_id: user.id,
    });

    return {
      statusCode: StatusCodes.OK,
      message: 'Gig deleted successfully',
      data: deletedGig,
    };
  }),

  getMyGigs: catchAsync<TGetMyGigs>(async ({ query, user }) => {
    const { gigs, meta } = await OfferpostServices.getMyGigs({
      ...query,
      user_id: user.id,
    });

    return {
      message: 'Gigs retrieved successfully',
      meta,
      data: gigs,
    };
  }),

  searchOtherGigs: catchAsync<TSearchOtherGigs>(async ({ query, user }) => {
    const { gigs, meta } = await OfferpostServices.searchOtherGigs({
      ...query,
      user_id: user.id,
    });

    return {
      message: 'Gigs retrieved successfully',
      meta,
      data: gigs,
    };
  }),

  /**
   * Request to join a gig. This creates an OfferpostGigRequest with status PENDING.
   */
  requestGig: catchAsync<TRequestGig>(async ({ user, body }) => {
    const data = await OfferpostServices.requestGig({
      ...body,
      user_id: user.id,
    });

    return {
      message: 'Gig request sent successfully',
      data,
    };
  }),

  /**
   * Get the authenticated user's gig requests, with optional filtering by status (default: PENDING).
   */
  getSendGigRequests: catchAsync<TGetSendGigRequests>(
    async ({ query, user }) => {
      const { meta, requests } = await OfferpostServices.getSendGigRequests({
        ...query,
        user_id: user.id,
      });

      return {
        message: 'Gig requests retrieved successfully',
        meta,
        data: requests,
      };
    },
  ),

  /**
   * Get the authenticated user's received gig requests, with optional filtering by status (default: PENDING).
   */
  getReceivedGigRequests: catchAsync<TGetReceivedGigRequests>(
    async ({ query, user }) => {
      const { meta, requests } = await OfferpostServices.getReceivedGigRequests(
        {
          ...query,
          user_id: user.id,
        },
      );

      return {
        message: 'Gig requests retrieved successfully',
        meta,
        data: requests,
      };
    },
  ),
};
