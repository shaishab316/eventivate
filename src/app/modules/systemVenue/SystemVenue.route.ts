import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { SystemVenueValidations } from './SystemVenue.validation';
import { SystemVenueControllers } from './SystemVenue.controller';
import capture from '../../middlewares/capture';

const router = Router();

router.post(
  '/',
  capture({
    image_url: {
      fileType: 'images',
      size: 15 * 1024 * 1024, // 15MB
      maxCount: 1,
    },
  }),
  purifyRequest(SystemVenueValidations.createVenue),
  SystemVenueControllers.createVenue,
);

router.patch(
  '/',
  capture({
    image_url: {
      fileType: 'images',
      size: 15 * 1024 * 1024, // 15MB
      maxCount: 1,
    },
  }),
  purifyRequest(SystemVenueValidations.updateVenue),
  SystemVenueControllers.updateVenue,
);

router.get(
  '/search-venues',
  purifyRequest(SystemVenueValidations.searchVenues),
  SystemVenueControllers.searchSystemVenues,
);

export const SystemVenueRoutes = router;
