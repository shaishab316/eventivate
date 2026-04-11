import { OfferRequestServices } from './OfferRequest.service';
import catchAsync from '../../middlewares/catchAsync';
import { StatusCodes } from 'http-status-codes';

export const OfferRequestControllers = {
  /**
   * Send a new offer request
   */
  send: catchAsync(async ({ body, user }) => {
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
};
