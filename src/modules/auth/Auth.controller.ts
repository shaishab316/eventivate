import catchAsync from "@/middlewares/catchAsync";
import { CRegisterUser, CVerifyEmail } from "./Auth.interface";
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
 * Controller for verifying a user's email address using a token and OTP. It validates the token, retrieves the associated user, and checks the provided OTP against the expected value. If the verification is successful, it marks the user's email as verified in the database and returns access and refresh tokens for authenticated sessions. If any step of the verification process fails (e.g., invalid token, incorrect OTP), it throws an appropriate error with a descriptive message.
 */
const verifyEmail = catchAsync<CVerifyEmail>(async ({ query }) => {
  const data = await AuthServices.verifyEmail(query);

  return {
    message: "Email verified successfully",
    data,
  };
});

/**
 * Export all Auth controllers
 */
export const AuthControllers = {
  registerUser,
  verifyEmail,
};
