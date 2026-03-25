import catchAsync from '../../middlewares/catchAsync';
import {
  TCreateSystemVenue,
  TSearchSystemVenues,
  TUpdateSystemVenue,
} from './SystemVenue.interface';
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

  createVenue: catchAsync<TCreateSystemVenue>(async ({ body }) => {
    const data = await SystemVenueServices.createVenue(body);

    return {
      message: 'System venue created successfully',
      data,
    };
  }),

  updateVenue: catchAsync<TUpdateSystemVenue>(async ({ body }) => {
    const data = await SystemVenueServices.updateVenue(body);

    return {
      message: 'System venue updated successfully',
      data,
    };
  }),
};
