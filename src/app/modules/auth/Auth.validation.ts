import { z } from 'zod';
import config from '../../../config';
import { EUserRole } from '../../../utils/db';

export const AuthValidations = {
  login: z.object({
    body: z.object({
      email: z.email({ error: 'Email is invalid' }),
      password: z
        .string({ error: 'Password is missing' })
        .min(6, 'Password must be at least 6 characters long'),
    }),
  }),

  otpSend: z.object({
    body: z.object({
      email: z.email({ error: 'Email is invalid' }),
    }),
  }),

  accountVerify: z.object({
    body: z.object({
      email: z.email({ error: 'Email is invalid' }),
      otp: z.coerce
        .string({ error: 'Otp is missing' })
        .length(config.otp.length, `Otp must be ${config.otp.length} digits`),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      password: z
        .string({ error: 'Password is missing' })
        .min(6, 'Password must be 6 characters long'),
    }),
  }),

  googleLogin: z.object({
    body: z.object({
      access_token: z
        .string({ error: 'Access token is missing' })
        .nonempty('Access token is required'),
      role: z.enum(EUserRole).default(EUserRole.USER),
    }),
  }),
};
