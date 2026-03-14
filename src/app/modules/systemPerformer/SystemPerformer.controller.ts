import catchAsync from '../../middlewares/catchAsync';
import { SystemPerformerServices } from './SystemPerformer.service';

export const SystemPerformerControllers = {
  getAllGenres: catchAsync(async () => {
    const data = await SystemPerformerServices.getAllGenres();

    return {
      message: 'Genres retrieved successfully',
      data,
    };
  }),
};
