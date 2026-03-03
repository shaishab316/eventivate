import type { Prisma, User } from "@/db";
import type { userOmit } from "./User.constant";

/**********************************/
/******* Constant interface *******/
/**********************************/

export type CUserOmit = keyof typeof userOmit;

/**********************************/
/******** Model interface *********/
/**********************************/

export type MSafeUser = Omit<User, CUserOmit>;

/**********************************/
/******* Service interface ********/
/**********************************/

export type SCreateUser = (
  payload: Omit<Prisma.UserCreateInput, "user_id" | "otp_salt">,
) => Promise<MSafeUser>;
