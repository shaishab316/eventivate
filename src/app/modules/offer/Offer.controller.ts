import catchAsync from '../../middlewares/catchAsync';
import { OfferServices } from './Offer.service';

export const OfferControllers = {
  createOffer: catchAsync(async ({ body, user }) => {
    const offer = await OfferServices.createOffer({ ...body, user });

    return {
      message: 'Offer created successfully',
      data: offer,
    };
  }),

  getOfferDetails: catchAsync(async ({ params, user }) => {
    const offer = await OfferServices.getOfferDetails({
      offer_id: params.offer_id,
      user,
    });

    return {
      message: 'Offer details fetched successfully',
      data: offer,
    };
  }),
};
