import catchAsync from '../../middlewares/catchAsync';
import { OfferServices } from './Offer.service';

/**
 * Controller methods for handling HTTP requests related to offers.
 */
export const OfferControllers = {
  /**
   * Create a new offer.
   */
  createOffer: catchAsync(async ({ body, user }) => {
    const offer = await OfferServices.createOffer({ ...body, user });

    return {
      message: 'Offer created successfully',
      data: offer,
    };
  }),

  /**
   * Get offer details by ID.
   */
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

  /**
   * Get all offers related to the user with pagination and optional filtering.
   */
  getAllOffers: catchAsync(async ({ query, user }) => {
    const { offers, meta } = await OfferServices.getAllOffers({
      ...query,
      user,
    });

    return {
      message: 'Offers fetched successfully',
      meta,
      data: offers,
    };
  }),

  /**
   * Accept an offer.
   */
  acceptOffer: catchAsync(async ({ body, user }) => {
    const offer = await OfferServices.acceptOffer({ ...body, user });

    return {
      message: 'Offer accepted successfully',
      data: offer,
    };
  }),
};
