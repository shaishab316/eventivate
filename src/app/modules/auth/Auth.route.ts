import { Router } from 'express';
import { AuthControllers } from './Auth.controller';
import { AuthValidations } from './Auth.validation';
import { UserControllers } from '../user/User.controller';
import { UserValidations } from '../user/User.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import auth from '../../middlewares/auth';
import { authRateLimiter } from './Auth.utils';

const free = Router();
{
  free.post(
    '/register',
    authRateLimiter,
    purifyRequest(UserValidations.userRegister),
    UserControllers.register,
  );

  free.post(
    '/agent-register',
    authRateLimiter,
    purifyRequest(UserValidations.agentRegister),
    UserControllers.register,
  );

  free.post(
    '/venue-register',
    authRateLimiter,
    purifyRequest(UserValidations.venueRegister),
    UserControllers.register,
  );

  free.post(
    '/artist-register',
    authRateLimiter,
    purifyRequest(UserValidations.artistRegister),
    UserControllers.register,
  );

  free.post(
    '/organizer-register',
    authRateLimiter,
    purifyRequest(UserValidations.organizerRegister),
    UserControllers.register,
  );
}

free.post(
  '/account-verify',
  authRateLimiter,
  purifyRequest(AuthValidations.accountVerify),
  AuthControllers.accountVerify,
);
{
  free.post(
    '/login',
    authRateLimiter,
    purifyRequest(AuthValidations.login),
    AuthControllers.login,
  );

  free.post(
    '/google-login',
    purifyRequest(AuthValidations.googleLogin),
    AuthControllers.googleLogin,
  );
}

free.post(
  '/account-verify/otp-send',
  purifyRequest(AuthValidations.otpSend),
  AuthControllers.accountVerifyOtpSend,
);

free.post(
  '/forgot-password',
  authRateLimiter,
  purifyRequest(AuthValidations.otpSend),
  AuthControllers.forgotPassword,
);

free.post(
  '/forgot-password/otp-verify',
  authRateLimiter,
  purifyRequest(AuthValidations.accountVerify),
  AuthControllers.forgotPasswordOtpVerify,
);

free.post(
  '/reset-password',
  auth.reset_token,
  purifyRequest(AuthValidations.resetPassword),
  AuthControllers.resetPassword,
);

free.get('/logout', AuthControllers.logout);

/**
 * generate new access token
 */
free.get('/refresh-token', auth.refresh_token, AuthControllers.refreshToken);

export const AuthRoutes = {
  /**
   * Everyone can access
   *
   * @url : (base_url)/auth/
   */
  free,
};
