import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import type {
  TAcceptGigRequest,
  TCancelGigRequest,
  TCreateGig,
  TGetMyGigs,
  TGetMyOfferposts,
  TGetReceivedGigRequests,
  TGetSendGigRequests,
  TLeaveFromOfferpost,
  TRequestGig,
  TSearchOtherGigs,
  TUpdateGig,
  TUpdateOfferpost,
} from './Offerpost.interface';
import { OfferpostServices } from './Offerpost.service';
import { omit } from '../../../utils/db/omit';
import { userOmit } from '../user/User.constant';

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

  /**
   * Cancel a gig request. This sets the OfferpostGigRequest's status to CANCELED.
   */
  cancelGigRequest: catchAsync<TCancelGigRequest>(async ({ body, user }) => {
    const data = await OfferpostServices.cancelGigRequest({
      ...body,
      user_id: user.id,
    });

    return {
      message: 'Gig request canceled successfully',
      data,
    };
  }),

  /**
   * Accept a gig request. This sets the OfferpostGigRequest's status to ACCEPTED, and may trigger additional actions like notifications or calendar invites depending on the application's requirements.
   */
  acceptGigRequest: catchAsync<TAcceptGigRequest>(async ({ body, user }) => {
    const data = await OfferpostServices.acceptGigRequest({
      ...body,
      user_id: user.id,
    });

    return {
      message: 'Gig request accepted successfully',
      data,
    };
  }),

  /**
   * Create an offerpost for the authenticated user. This initializes a new offerpost with default values, which the user can then edit to add gigs and details.
   */
  createOfferpost: catchAsync(async ({ user }) => {
    const data = await OfferpostServices.createOfferpost({
      user_id: user.id,
    });

    return {
      message: 'Offerpost created successfully',
      data: {
        ...data,
        members: data.members.map(mem => omit(mem, userOmit[user.role])),
        admins: data.admins.map(admin => omit(admin, userOmit[user.role])),
      },
    };
  }),

  /**
   * Get the authenticated user's offerposts, with optional filtering by status (default: PENDING).
   */
  getMyOfferposts: catchAsync<TGetMyOfferposts>(async ({ query, user }) => {
    const { offerposts, meta } = await OfferpostServices.getMyOfferposts({
      ...query,
      user_id: user.id,
    });

    return {
      message: 'Offerposts retrieved successfully',
      meta,
      data: offerposts.map(offerpost => ({
        ...offerpost,
        members: offerpost.members.map(mem => omit(mem, userOmit[user.role])),
        admins: offerpost.admins.map(admin => omit(admin, userOmit[user.role])),
      })),
    };
  }),

  /**
   * Leave an offerpost. This removes the user from the offerpost's members, and if they are an admin, also from the admins. If the user is the last member, the offerpost may be deleted or set to an inactive state depending on business rules.
   */
  leaveFromOfferpost: catchAsync<TLeaveFromOfferpost>(
    async ({ body, user }) => {
      const data = await OfferpostServices.leaveFromOfferpost({
        ...body,
        user_id: user.id,
      });

      return {
        message: 'Left offerpost successfully',
        data,
      };
    },
  ),

  /**
   * updata an offerpost. Only the owner of the offerpost can perform this action. This allows updating certain fields of the offerpost, such as its status or attachment_url. More fields can be added as needed.
   */
  updateOfferpost: catchAsync<TUpdateOfferpost>(async ({ body, user }) => {
    const data = await OfferpostServices.updateOfferpost({
      ...body,
      user_id: user.id,
    });

    return {
      message: 'Offerpost updated successfully',
      data,
    };
  }),
};
