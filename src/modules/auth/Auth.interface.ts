import type { z } from "zod";
import type { AuthValidations } from "./Auth.validation";

/**********************************/
/****** Validation interface ******/
/**********************************/

export type CRegisterUser = z.infer<typeof AuthValidations.registerUserSchema>;
export type SRegisterUserPayload = CRegisterUser["body"];
export type SRegisterUser = (payload: SRegisterUserPayload) => Promise<{
  access_token: string;
  expires_in: string;
}>;

/**********************************/
/******* Service interface ********/
/**********************************/

export type SSendVerificationEmailPayload = {
  email: string;
  token: string;
};

export type SSendVerificationEmail = (
  payload: SSendVerificationEmailPayload,
) => Promise<void>;
