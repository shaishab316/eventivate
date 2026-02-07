import { z } from 'zod';
import config from '../../../config';
import { userSharedValidation } from '../user/User.validation';

const _ = {
  ...userSharedValidation,

  otp: z.coerce
    .string({ error: 'Otp is missing' })
    .length(config.otp.length, `Otp must be ${config.otp.length} digits`),
};

export const AuthValidations = {
  login: z.object({
    body: z.object({
      email: _.email,
      password: _.password,
    }),
  }),

  otpSend: z.object({
    body: z.object({
      email: _.email,
    }),
  }),

  accountVerify: z.object({
    body: z.object({
      email: _.email,
      otp: _.otp,
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      password: _.password,
    }),
  }),

  googleLogin: z.object({
    body: z.object({
      access_token: z
        .string({ error: 'Access token is missing' })
        .nonempty('Access token is required'),
      role: _.role.default('USER'),
    }),
  }),
};
