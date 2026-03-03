import catchAsync from "@/middlewares/catchAsync";
import { CRegisterUser } from "./Auth.interface";
import { UserServices } from "../user/User.service";
import { AuthServices } from "./Auth.service";

/**
 * Controller for registering a new user
 */
const registerUser = catchAsync<CRegisterUser>(async ({ body: payload }) => {
  const data = await AuthServices.registerUser(payload);

  return {
    message: "User registered successfully",
    data,
  };
});

/**
 * Export all Auth controllers
 */
export const AuthControllers = {
  registerUser,
};
