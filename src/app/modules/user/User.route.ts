import { Router } from 'express';
import { UserControllers } from './User.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import { UserValidations } from './User.validation';
import capture from '../../middlewares/capture';
import { AuthControllers } from '../auth/Auth.controller';
import { authRateLimiter } from '../auth/Auth.utils';

const admin = Router();
{
  /**
   * Get all users
   */
  admin.get(
    '/',
    purifyRequest(QueryValidations.list, UserValidations.getAllUser),
    UserControllers.superGetAllUser,
  );

  /**
   * Edit user
   */
  admin.patch(
    '/:userId/edit',
    purifyRequest(
      QueryValidations.exists('userId', 'user'),
      UserValidations.superEditProfile,
    ),
    UserControllers.superEditProfile,
  );

  /**
   * Delete user
   */
  admin.delete(
    '/:userId/delete',
    purifyRequest(QueryValidations.exists('userId', 'user')),
    UserControllers.superDeleteAccount,
  );
}

const all = Router();
{
  /**
   * Get user profile
   */
  all.get('/', UserControllers.profile);

  /**
   * Edit user profile
   */
  all.patch(
    '/edit',
    capture({
      avatar: {
        size: 5 * 1024 * 1024,
        maxCount: 1,
        fileType: 'images',
      },
    }),
    purifyRequest(UserValidations.editProfile),
    UserControllers.editProfile,
  );

  /**
   * Edit user availability
   */
  all.post(
    '/update-availability',
    purifyRequest(UserValidations.updateAvailability),
    UserControllers.updateAvailability,
  );

  /**
   * Delete user account
   */
  all.delete('/delete', UserControllers.deleteAccount);

  /**
   * Change user password
   */
  all.post(
    '/change-password',
    authRateLimiter,
    purifyRequest(UserValidations.changePassword),
    AuthControllers.changePassword,
  );

  /**
   * Connect stripe account
   */
  all.post('/connect-stripe', UserControllers.connectStripeAccount);

  /**
   * Get all users
   */
  all.get(
    '/other-users',
    purifyRequest(QueryValidations.list, UserValidations.getAllUser),
    UserControllers.getAllUser,
  );
}

export const UserRoutes = {
  /**
   * Only admin can access
   *
   * @url : (base_url)/admin/users/
   */
  admin,

  /**
   * All users can access
   *
   * @url : (base_url)/profile/
   */
  all,
};
