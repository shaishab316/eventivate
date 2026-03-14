import catchAsync from '../../middlewares/catchAsync';
import { TSearchSystemVenues } from './SystemVenue.interface';
import { SystemVenueServices } from './SystemVenue.service';

export const SystemVenueControllers = {
  searchSystemVenues: catchAsync<TSearchSystemVenues>(async ({ query }) => {
    const { venues, meta } =
      await SystemVenueServices.searchSystemVenues(query);

    return {
      message: 'System venues retrieved successfully',
      meta,
      data: venues,
    };
  }),
};
