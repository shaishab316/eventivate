import type { z } from "zod";
import type { AuthValidations } from "./Auth.validation";

/**********************************/
/****** Validation interface ******/
/**********************************/

export type CRegisterUser = z.infer<typeof AuthValidations.registerUserSchema>;
export type SRegisterUserPayload = CRegisterUser["body"];
