import { UserServices } from './User.service';
import catchAsync from '../../middlewares/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { prisma, User as TUser } from '../../../utils/db';
import { enum_decode } from '../../../utils/transform/enum';
import { capitalize } from '../../../utils/transform/capitalize';
import { stripe } from '../payment/Payment.utils';
import ServerError from '../../../errors/ServerError';
import stripeAccountConnectQueue from '../../../utils/mq/stripeAccountConnectQueue';
import config from '../../../config';
import { userSelfOmit } from './User.constant';
import type { TUserSuperEdit } from './User.interface';

/**
 * User controllers
 */
export const UserControllers = {
  /**
   * Register user
   */
  register: catchAsync(async ({ body }, res) => {
    const user = await UserServices.register(body);

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
      'refresh_token',
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

    return {
      statusCode: StatusCodes.CREATED,
      message: `${capitalize(user.role) ?? 'Unknown'} registered successfully!`,
      data: {
        access_token,
        refresh_token,
        user,
      },
    };
  }),

  /**
   * Edit profile
   */
  editProfile: catchAsync(async req => {
    const data = await UserServices.updateUser(req);

    return {
      message: 'Profile updated successfully!',
      data,
    };
  }),

  /**
   * Super edit profile
   */
  superEditProfile: catchAsync<TUserSuperEdit>(
    async ({ params, body, user: admin }) => {
      if (!admin.is_super_admin && body.is_admin !== undefined) {
        throw new ServerError(
          StatusCodes.FORBIDDEN,
          'Only super admins can modify admin',
        );
      }

      const user = (await prisma.user.findUnique({
        where: { id: params.userId },
      })) as TUser;

      const data = await UserServices.updateUser({
        user,
        body,
      });

      return {
        message: `${capitalize(user?.role) ?? 'User'} updated successfully!`,
        data,
      };
    },
  ),

  /**
   * Get all users
   */
  getAllUser: catchAsync(async ({ query, user }) => {
    const { meta, users } = await UserServices.getAllUser({
      ...query,
      user_id: user.id,
    });

    return {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    };
  }),

  /**
   * Get all users
   */
  superGetAllUser: catchAsync(async ({ query }) => {
    const { meta, users } = await UserServices.getAllUser(query);

    Object.assign(meta, {
      users: await UserServices.getUsersCount(),
    });

    return {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    };
  }),

  /**
   * Get profile
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  profile: catchAsync(async ({ user }) => {
    return {
      message: 'Profile retrieved successfully!',
      data: {
        ...(await prisma.user.findUnique({
          where: { id: user.id },
          omit: userSelfOmit[user.role],
        })),
        role: user.role.toLowerCase(),
      },
    };
  }),

  /**
   * Delete account
   */
  superDeleteAccount: catchAsync(async ({ params }) => {
    const user = await UserServices.deleteAccount(params.userId);

    return {
      message: `${user?.name ?? 'User'} deleted successfully!`,
    };
  }),

  /**
   * Delete account
   */
  deleteAccount: catchAsync(async ({ user }) => {
    await UserServices.deleteAccount(user.id);

    return {
      message: `Goodbye ${user?.name ?? enum_decode(user.role)}! Your account has been deleted successfully!`,
    };
  }),

  /**
   * Update availability
   */
  updateAvailability: catchAsync(async ({ body, user }) => {
    await UserServices.updateAvailability({
      ...body,
      user_id: user.id,
    });

    return {
      message: 'Availability updated successfully!',
      data: body,
    };
  }),

  /**
   *
   */
  connectStripeAccount: catchAsync(async ({ user }) => {
    if (!user.stripe_account_id) {
      await stripeAccountConnectQueue.add({ user_id: user.id });

      return {
        statusCode: StatusCodes.ACCEPTED,
        message: 'Stripe account connecting. Try again later!',
      };
    }

    if (user.is_stripe_connected) {
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'Stripe account already connected',
      );
    }

    const { url } = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: `${config.url.href}/not-found`,
      return_url: `${config.url.href}/payments/stripe/connect?user_id=${user.id}`,
      type: 'account_onboarding',
    });

    return {
      message: 'Stripe connect link created successfully!',
      data: {
        url,
      },
    };
  }),
};
