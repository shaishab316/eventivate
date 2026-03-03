import catchAsync from "@/middlewares/catchAsync";
import { CRegisterUser } from "./Auth.interface";
import { UserServices } from "../user/User.service";

/**
 * Controller for registering a new user
 */
const registerUser = catchAsync<CRegisterUser>(async ({ body: payload }) => {
  const user = await UserServices.createUser(payload);

  return {
    message: "User registered successfully",
    data: user,
  };
});

/**
 * Export all Auth controllers
 */
export const AuthControllers = {
  registerUser,
};
