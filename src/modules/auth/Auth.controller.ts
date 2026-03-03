import catchAsync from "@/middlewares/catchAsync";
import {
  CForgotPassword,
  CLoginUser,
  CRegisterUser,
  CResetPasswordOtpVerify,
  CVerifyEmail,
} from "./Auth.interface";
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
 * Controller for logging in a user. It validates the user's email and password, and if successful, returns the authenticated user's information along with access and refresh tokens. If the login credentials are invalid, it throws an error indicating that the email or password is incorrect.
 */
const loginUser = catchAsync<CLoginUser>(async ({ body }) => {
  const data = await AuthServices.loginUser(body);

  return {
    message: "Login successful",
    data,
  };
});

/**
 * Controller for handling forgot password requests. It accepts the user's email, and if the email is registered, it initiates the password reset process by sending a password reset OTP to the user's email address. The response indicates that if the email is registered, a password reset OTP has been sent, without revealing whether the email exists in the system for security reasons. The function returns an expiration time for the OTP, which can be used by the client to inform the user about how long they have to use the OTP before it expires.
 */
const forgotPassword = catchAsync<CForgotPassword>(async ({ body }) => {
  const data = await AuthServices.forgotPassword(body);

  return {
    message: "If the email is registered, a password reset OTP has been sent",
    data,
  };
});

/**
 * Controller for verifying the OTP provided by the user for password reset. It checks if the provided email exists, generates the expected OTP using the user's unique OTP salt, and compares it with the provided OTP. If the OTP is valid, it generates a reset token that can be used to authenticate subsequent password reset requests. The response includes a message indicating that the OTP was verified successfully and returns the reset token. If the email does not exist or the OTP is invalid/expired, it throws an error indicating that the OTP verification failed.
 */
const resetPasswordOtpVerify = catchAsync<CResetPasswordOtpVerify>(
  async ({ body: payload }) => {
    const data = await AuthServices.resetPasswordOtpVerify(payload);

    return {
      message: "OTP verified successfully",
      data,
    };
  },
);

/**
 * Controller for resetting the user's password. It accepts a reset token and a new password, validates the reset token to ensure it is valid and of the correct type, and then updates the user's password in the database with the new hashed password. If the token is invalid or expired, it throws an error indicating that the password reset failed. Upon successful password reset, it returns a message confirming that the password has been reset successfully.
 */
const resetPassword = catchAsync(async ({ body: payload }) => {
  await AuthServices.resetPassword(payload);

  return {
    message:
      "Password reset successfully. You can now log in with your new password.",
  };
});

/**
 * Export all Auth controllers
 */
export const AuthControllers = {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPasswordOtpVerify,
  resetPassword,
};
