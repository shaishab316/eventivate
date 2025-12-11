import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { OfferValidations } from './Offer.validation';
import { OfferControllers } from './Offer.controller';
import capture from '../../middlewares/capture';
import { QueryValidations } from '../query/Query.validation';

export const captureDocument = capture({
  document: {
    fileType: 'any',
    size: 50 * 1024 * 1024, // 50 MB
    maxCount: 1,
  },
});

const all = Router();
{
  /**
   * Get all offers related to the user with pagination and optional filtering.
   */
  all.get(
    '/',
    purifyRequest(QueryValidations.list, OfferValidations.getAllOffers),
    OfferControllers.getAllOffers,
  );

  /**
   * Get offer details by ID.
   */
  all.get(
    '/:offer_id',
    purifyRequest(QueryValidations.exists('offer_id', 'offer')),
    OfferControllers.getOfferDetails,
  );

  /**
   * Create a new offer.
   */
  all.post(
    '/',
    captureDocument,
    purifyRequest(OfferValidations.createOffer),
    OfferControllers.createOffer,
  );

  /**
   * Accept an offer.
   */
  all.post(
    '/accept',
    captureDocument,
    purifyRequest(OfferValidations.acceptOffer),
    OfferControllers.acceptOffer,
  );
}

export const OfferRoutes = {
  /**
   * all users can access,
   *
   * @url (base_url)/offers
   */
  all,
};
