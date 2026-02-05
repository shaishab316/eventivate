import { EUserRole } from '../../../utils/db';
import catchAsync from '../../middlewares/catchAsync';
import { TCancelVenueOfferArgs, TSearchVenues } from './Venue.interface';
import { VenueServices } from './Venue.service';

/**
 * All venue related controllers
 */
export const VenueControllers = {
  /**
   * Update venue information
   */
  updateVenue: catchAsync(async ({ body, user: venue }) => {
    const data = await VenueServices.updateVenue({
      ...body,
      venue_id: venue.id,
    });

    return {
      message: 'Venue updated successfully!',
      data,
    };
  }),

  /**
   * Create new agent offer
   */
  createOffer: catchAsync(async ({ body, user: venue }) => {
    const data = await VenueServices.createOffer({
      ...body,
      venue_id: venue.id,
    });

    return {
      message: 'Offer created successfully!',
      data,
    };
  }),

  /**
   * cancelOffer
   */
  cancelOffer: catchAsync(async ({ body, user }) => {
    const payload: TCancelVenueOfferArgs = { offer_id: body.offer_id };

    if (user.role === EUserRole.AGENT) {
      payload.venue_id = user.id;
    } else if (user.role === EUserRole.ORGANIZER) {
      payload.organizer_id = user.id;
    }

    await VenueServices.cancelOffer(payload);

    return {
      message: 'Offer cancelled successfully!',
    };
  }),

  /**
   * Get my offers
   */
  getMyOffers: catchAsync(async ({ query, user }) => {
    const { meta, offers } = await VenueServices.getMyOffers({
      ...query,
      venue_id: user.id,
    });

    return {
      message: 'Venue offers retrieved successfully!',
      meta,
      data: offers,
    };
  }),

  /**
   * Get venue overview
   */
  getVenueOverview: catchAsync(async ({ user: venue }) => {
    const overview = await VenueServices.getVenueOverview(venue.id);

    return {
      message: 'Venue overview retrieved successfully!',
      data: overview,
    };
  }),

  /**
   * Get all venues with pagination and search
   */
  getAllVenues: catchAsync(async ({ query }) => {
    const { meta, venues } = await VenueServices.getAllVenues(query);

    return {
      message: 'Venues retrieved successfully!',
      meta,
      data: venues,
    };
  }),

  /**
   * Search venues
   */
  searchVenues: catchAsync<TSearchVenues>(async ({ query }) => {
    const { meta, venues } = await VenueServices.searchVenues(query);

    return {
      message: 'Venues retrieved successfully!',
      meta,
      data: venues,
    };
  }),
};
