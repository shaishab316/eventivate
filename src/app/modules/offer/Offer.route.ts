import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { OfferValidations } from './Offer.validation';
import { OfferControllers } from './Offer.controller';
import capture from '../../middlewares/capture';
import { QueryValidations } from '../query/Query.validation';

const all = Router();
{
  all.get(
    '/',
    purifyRequest(QueryValidations.list, OfferValidations.getAllOffers),
    OfferControllers.getAllOffers,
  );

  all.get(
    '/:offer_id',
    purifyRequest(QueryValidations.exists('offer_id', 'offer')),
    OfferControllers.getOfferDetails,
  );

  all.post(
    '/',
    capture({
      document: {
        fileType: 'any',
        size: Infinity,
        maxCount: 1,
      },
    }),
    purifyRequest(OfferValidations.createOffer),
    OfferControllers.createOffer,
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
