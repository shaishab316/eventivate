import { Router } from 'express';
import { SystemPerformerControllers } from './SystemPerformer.controller';

const router = Router();

router.get('/all-genres', SystemPerformerControllers.getAllGenres);

export const SystemPerformerRoutes = router;
