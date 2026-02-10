import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import { TCreateGig, TUpdateGig } from './Offerpost.interface';
import { OfferpostServices } from './Offerpost.service';

export const OfferpostControllers = {
  createGig: catchAsync<TCreateGig>(async ({ user, body }) => {
    const newGig = await OfferpostServices.createGig({
      ...body,
      owner_id: user.id,
      owner_role: user.role,
    });

    return {
      statusCode: StatusCodes.CREATED,
      message: 'Gig created successfully',
      data: newGig,
    };
  }),

  updateGig: catchAsync<TUpdateGig>(async ({ user, body }) => {
    const updatedGig = await OfferpostServices.updateGig({
      ...body,
      user_id: user.id,
    });

    return {
      statusCode: StatusCodes.OK,
      message: 'Gig updated successfully',
      data: updatedGig,
    };
  }),

  deleteGig: catchAsync(async ({ user, body }) => {
    const deletedGig = await OfferpostServices.deleteGig({
      ...body,
      user_id: user.id,
    });

    return {
      statusCode: StatusCodes.OK,
      message: 'Gig deleted successfully',
      data: deletedGig,
    };
  }),
};
