import { Router } from 'express';
import { VenueValidations } from './Venue.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import { VenueControllers } from './Venue.controller';
import { QueryValidations } from '../query/Query.validation';

const venue = Router();
{
  /**
   * Get venue overview
   */
  venue.get('/overview', VenueControllers.getVenueOverview);

  /**
   * Update venue information
   */
  venue.patch(
    '/edit',
    purifyRequest(VenueValidations.updateVenue),
    VenueControllers.updateVenue,
  );

  /**
   * Create new venue offer to organizer
   */
  venue.post(
    '/create-offer',
    purifyRequest(VenueValidations.createOffer),
    VenueControllers.createOffer,
  );

  /**
   * Cancel agent offer
   */
  venue.post(
    '/cancel-offer',
    purifyRequest(VenueValidations.cancelOffer),
    VenueControllers.cancelOffer,
  );

  /**
   * Get my offers
   */
  venue.get(
    '/my-offers',
    purifyRequest(QueryValidations.list, VenueValidations.getMyOffers),
    VenueControllers.getMyOffers,
  );
}

const all = Router();
{
  /**
   * Get all venues with pagination and search
   */
  all.get(
    '/',
    purifyRequest(QueryValidations.list),
    VenueControllers.getAllVenues,
  );

  all.get(
    '/search-venues',
    purifyRequest(QueryValidations.list, VenueValidations.searchVenues),
    VenueControllers.searchVenues,
  );
}

export const VenueRoutes = {
  /**
   * Only venue can access
   *
   * @url : (base_url)/venue/
   */
  venue,

  /**
   * No auth required
   *
   * @url : (base_url)/venues/
   */
  free: all,
};
