import type z from 'zod';
import { AuthValidations } from './Auth.validation';

export type TUserLogin = z.infer<typeof AuthValidations.login>['body'];

export type TAccountVerify = z.infer<
  typeof AuthValidations.accountVerify
>['body'];

export type TAccountVerifyOtpSend = z.infer<
  typeof AuthValidations.otpSend
>['body'];

export type TResetPassword = z.infer<
  typeof AuthValidations.resetPassword
>['body'];

export type TGoogleLogin = z.infer<typeof AuthValidations.googleLogin>['body'];

export type TGoogleUser = {
  id: string;
  email?: string;
  verified_email?: boolean;
  picture?: string | null;
};

export type TFacebookUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  picture?: {
    data?: {
      url?: string | null;
    } | null;
  } | null;
};
