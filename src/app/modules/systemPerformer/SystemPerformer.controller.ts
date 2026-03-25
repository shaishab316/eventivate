import catchAsync from '../../middlewares/catchAsync';
import { TSearchSystemPerformers } from './SystemPerformer.interface';
import { SystemPerformerServices } from './SystemPerformer.service';

export const SystemPerformerControllers = {
  getAllGenres: catchAsync(async () => {
    const data = await SystemPerformerServices.getAllGenres();

    return {
      message: 'Genres retrieved successfully',
      data,
    };
  }),

  searchPerformers: catchAsync<TSearchSystemPerformers>(async ({ query }) => {
    const { performers, meta } =
      await SystemPerformerServices.searchPerformers(query);

    return {
      message: 'Performers retrieved successfully',
      meta,
      data: performers,
    };
  }),
};
