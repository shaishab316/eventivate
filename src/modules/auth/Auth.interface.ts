import type { z } from "zod";
import type { AuthValidations } from "./Auth.validation";
import type { MSafeUser } from "../user/User.interface";

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

/**********************************/
/******* Service interface ********/
/**********************************/
export type IRegisterJWTPayload = {
  type: "register";
  encrypted_body: string; // Encrypted string containing the registration payload (email, password, etc.)
};

export type IResetPasswordJWTPayload = {
  type: "reset_password";
  encrypted_body: string; // Encrypted string containing the password reset payload (email, otp_salt, etc.)
};

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
};

export type SSendPasswordResetEmail = (
  payload: SSendPasswordResetEmailPayload,
) => Promise<void>;
