import { Router } from 'express';
import { SystemPerformerControllers } from './SystemPerformer.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { SystemPerformerValidations } from './SystemPerformer.validation';

const router = Router();

router.get('/all-genres', SystemPerformerControllers.getAllGenres);
router.get(
  '/search-performers',
  purifyRequest(SystemPerformerValidations.searchPerformers),
  SystemPerformerControllers.searchPerformers,
);

router.get('/:performerId', SystemPerformerControllers.getPerformerById);

export const SystemPerformerRoutes = router;
