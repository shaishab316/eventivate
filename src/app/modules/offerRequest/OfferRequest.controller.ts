import { OfferRequestServices } from './OfferRequest.service';
import catchAsync from '../../middlewares/catchAsync';
import { StatusCodes } from 'http-status-codes';
import {
  TOfferRequestGetAllController,
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
};
