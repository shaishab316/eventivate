import { OfferRequestServices } from './OfferRequest.service';
import catchAsync from '../../middlewares/catchAsync';
import { StatusCodes } from 'http-status-codes';
import {
  TOfferRequestGetAllController,
  TOfferRequestGetMyRequestsController,
  TOfferRequestSendController,
} from './OfferRequest.interface';

export const OfferRequestControllers = {
  /**
   * Send a new offer request
   */
  send: catchAsync<TOfferRequestSendController>(async ({ body, user }) => {
    const data = {
      ...body,
      user_id: user.id,
    };

    const offerRequest = await OfferRequestServices.send(data);

    return {
      statusCode: StatusCodes.CREATED,
      message: 'Offer request sent successfully!',
      data: offerRequest,
    };
  }),

  /**
   * Get all offer requests for admin with pagination, filtering, and sorting
   */
  getAllRequestsForAdmin: catchAsync<TOfferRequestGetAllController>(
    async ({ query }) => {
      const [requests, total] =
        await OfferRequestServices.getAllRequestsForAdmin(query);

      return {
        message: 'Offer requests retrieved successfully!',
        data: requests,
        meta: {
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
          },
        },
      };
    },
  ),

  /**
   * Get my offer requests with pagination, filtering, and sorting
   */
  getMyRequests: catchAsync<TOfferRequestGetMyRequestsController>(
    async ({ query, user }) => {
      const [requests, total] = await OfferRequestServices.getMyRequests({
        ...query,
        user_id: user.id,
      });

      return {
        message: 'Offer requests retrieved successfully!',
        data: requests,
        meta: {
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
          },
        },
      };
    },
  ),
};
