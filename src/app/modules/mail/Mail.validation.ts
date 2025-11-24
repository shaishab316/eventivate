import z from 'zod';
import { TModelZod } from '../../../types/zod';
import { EUserRole, Mail as TMail } from '../../../utils/db';
import { exists } from '../../../utils/db/exists';

/**
 * Mail Validations
 */
export const MailValidations = {
  /**
   * Admin Send Mail Validation
   */
  sendMail: z.object({
    body: z.object({
      remarks: z.enum(EUserRole),
      name: z.string({ error: 'Name is missing' }).trim().nonempty({
        error: 'Name is missing',
      }),
      email: z.email(),
      message: z
        .string({
          error: 'Message is missing',
        })
        .trim()
        .nonempty({ error: 'Message is missing' }),
    } satisfies TModelZod<TMail>),
  }),

  /**
   * Admin Get All Mail Validation
   */
  getAllMail: z.object({
    query: z.object({
      unread: z
        .string()
        .transform(str => str === 'true')
        .optional(),
      remarks: z.enum(EUserRole).optional(),
    }),
  }),

  /**
   * Mark Mail as Read Validation
   */
  markMail: z.object({
    body: z.object({
      mail_id: z.string().refine(exists('mail'), {
        error: ({ input }) => `Mail with id ${input} does not exist`,
      }),
    }),
  }),
};
