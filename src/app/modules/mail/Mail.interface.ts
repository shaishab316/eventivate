import z from 'zod';
import { MailValidations } from './Mail.validation';
import { TList } from '../query/Query.interface';

/**
 * Admin Mail Send Type
 */
export type TAdminMailSend = z.infer<typeof MailValidations.sendMail>['body'];

/**
 * Admin Mail Get All Type
 */
export type TAdminMailGetAll = z.infer<
  typeof MailValidations.getAllMail
>['query'] &
  TList;

/**
 * Mark Mail Type
 */
export type MarkMailArgs = z.infer<typeof MailValidations.markMail>['body'];
