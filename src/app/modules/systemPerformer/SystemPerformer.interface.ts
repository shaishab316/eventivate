import z from 'zod';
import { SystemPerformerValidations } from './SystemPerformer.validation';

export type TSearchSystemPerformers = z.infer<
  typeof SystemPerformerValidations.searchPerformers
>;

export type TSearchSystemPerformersPayload = TSearchSystemPerformers['query'];
