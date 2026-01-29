import z from 'zod';
import { QueryValidations } from './Query.validation';

export type TList = z.infer<typeof QueryValidations.list>['query'];
