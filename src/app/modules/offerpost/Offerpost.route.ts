import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { OfferpostControllers } from './Offerpost.controller';
import { OfferpostValidations } from './Offerpost.validation';
import auth from '../../middlewares/auth';
import capture from '../../middlewares/capture';

const router = Router();

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

export const OfferpostRoutes = router;
