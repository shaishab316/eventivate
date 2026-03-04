import type { z } from "zod";
import type { AuthValidations } from "./Auth.validation";
import type { MSafeUser } from "../user/User.interface";
import type { AppJwtPayload } from "@/utils/jwt";

/**********************************/
/****** Validation interface ******/
/**********************************/

export type CRegisterUser = z.infer<typeof AuthValidations.registerUserSchema>;
export type SRegisterUserPayload = CRegisterUser["body"];
export type SRegisterUser = (payload: SRegisterUserPayload) => Promise<{
  access_token: string;
  expires_in: string;
}>;

export type CVerifyEmail = z.infer<typeof AuthValidations.verifyEmailSchema>;
export type SVerifyEmailPayload = CVerifyEmail["query"];
export type SVerifyEmail = (payload: SVerifyEmailPayload) => Promise<{
  user: MSafeUser;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}>;

export type CLoginUser = z.infer<typeof AuthValidations.loginUserSchema>;
export type SLoginUserPayload = CLoginUser["body"];
export type SLoginUser = (payload: SLoginUserPayload) => Promise<{
  user: MSafeUser;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}>;

export type CForgotPassword = z.infer<
  typeof AuthValidations.forgotPasswordSchema
>;
export type SForgotPasswordPayload = CForgotPassword["body"];
export type SForgotPassword = (payload: SForgotPasswordPayload) => Promise<{
  expire_at: string; // ISO string indicating when the OTP expires
}>;

export type CResetPasswordOtpVerify = z.infer<
  typeof AuthValidations.resetPasswordOtpVerifySchema
>;
export type SResetPasswordOtpVerifyPayload = CResetPasswordOtpVerify["body"];
export type SResetPasswordOtpVerify = (
  payload: SResetPasswordOtpVerifyPayload,
) => Promise<{
  reset_token: string;
}>;

export type CResetPassword = z.infer<
  typeof AuthValidations.resetPasswordSchema
>;
export type SResetPasswordPayload = CResetPassword["body"];
export type SResetPassword = (payload: SResetPasswordPayload) => Promise<void>;

/**********************************/
/******* Service interface ********/
/**********************************/
export interface IRegisterJWTPayload extends AppJwtPayload {
  type: "register";
  encrypted_body: string; // Encrypted string containing the registration payload (email, password, etc.)
}

export interface IResetPasswordJWTPayload extends AppJwtPayload {
  type: "reset_password";
  user_id: string;
}

export interface IAccessJWTPayload extends AppJwtPayload {
  type: "access";
  user_id: string;
}

export interface IRefreshJWTPayload extends AppJwtPayload {
  type: "refresh";
  user_id: string;
}

export type SSendVerificationEmailPayload = {
  email: string;
  token: string;
};

export type SSendVerificationEmail = (
  payload: SSendVerificationEmailPayload,
) => Promise<void>;

export type SSendPasswordResetEmailPayload = {
  email: string;
  otp_salt: string;
  token: string;
};

export type SSendPasswordResetEmail = (
  payload: SSendPasswordResetEmailPayload,
) => Promise<void>;
