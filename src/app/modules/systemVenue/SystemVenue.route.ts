import { Router } from 'express';
import purifyRequest from '../../middlewares/purifyRequest';
import { SystemVenueValidations } from './SystemVenue.validation';
import { SystemVenueControllers } from './SystemVenue.controller';

const router = Router();

router.get(
  '/search-venues',
  purifyRequest(SystemVenueValidations.searchVenues),
  SystemVenueControllers.searchSystemVenues,
);

export const SystemVenueRoutes = router;
