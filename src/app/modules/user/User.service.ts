import type { TList } from '../query/Query.interface';
import {
  userSearchableFields as searchFields,
  userSelfOmit,
} from './User.constant';
import { EUserRole, Prisma, prisma, User as TUser } from '../../../utils/db';
import { TPagination } from '../../../utils/server/serveResponse';
import deleteFilesQueue from '../../../utils/mq/deleteFilesQueue';
import type { TUpdateAvailability, TUserEdit } from './User.interface';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { hashPassword } from '../auth/Auth.utils';
import { generateOTP } from '../../../utils/crypto/otp';
import emailQueue from '../../../utils/mq/emailQueue';
import { errorLogger } from '../../../utils/logger';
import { emailTemplate } from '../../../templates/emailTemplate';
import config from '../../../config';
import stripeAccountConnectQueue from '../../../utils/mq/stripeAccountConnectQueue';

/**
 * User services
 */
export const UserServices = {
  /**
   * Get next user id
   */
  async getNextUserId(
    where:
      | { role: EUserRole; is_admin?: never }
      | { role?: never; is_admin: true },
  ): Promise<string> {
    const prefix = where.role ? where.role.toLowerCase().slice(0, 2) : 'su';

    const user = await prisma.user.findFirst({
      where,
      orderBy: { created_at: 'desc' },
      select: { id: true },
    });

    if (!user) return `${prefix}-1`;

    const currSL = parseInt(user.id.split('-')[1], 10);
    return `${prefix}-${currSL + 1}`;
  },

  /**
   * Register user and send otp
   */
  async register({
    email,
    role,
    password,
    ...payload
  }: Omit<Prisma.UserCreateArgs['data'], 'id'>) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { role: true, is_verified: true }, //? skip body
    });

    //? ensure user doesn't exist
    if (existingUser?.is_verified)
      throw new ServerError(
        StatusCodes.CONFLICT,
        `${existingUser.role} already exists with this ${email} email.`,
      );

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role,
        password: await hashPassword(password),
        ...payload,
      },
      create: {
        id: await UserServices.getNextUserId({ role: role ?? EUserRole.USER }),
        email,
        role,
        password: await hashPassword(password),
        ...payload,
      },
      omit: {
        ...userSelfOmit[role!],
        otp_id: false,
        stripe_account_id: false,
      },
    });

    if (!user.stripe_account_id) {
      await stripeAccountConnectQueue.add({
        user_id: user.id,
      });
    }

    try {
      const otp = generateOTP({
        tokenType: 'access_token',
        otpId: user.id + user.otp_id,
      });

      await emailQueue.add({
        to: user.email,
        subject: `Your ${config.server.name} Account Verification OTP is ⚡ ${otp} ⚡.`,
        html: await emailTemplate({
          userName: user.name,
          otp,
          template: 'account_verify',
        }),
      });
    } catch (error) {
      if (error instanceof Error) errorLogger.error(error.message);
    }

    return {
      ...user,
      otp_id: undefined,
      stripe_account_id: undefined,
    };
  },

  async updateUser({ user, body }: { user: Partial<TUser>; body: TUserEdit }) {
    const data: Prisma.UserUpdateInput = body;

    if (body.avatar && user.avatar) await deleteFilesQueue.add([user.avatar]);

    if (body.role && body.role !== user.role)
      data.id = await this.getNextUserId({ role: body.role });

    return prisma.user.update({
      where: { id: user.id },
      omit: userSelfOmit[body.role ?? user.role ?? EUserRole.USER],
      data,
    });
  },

  /**
   * Get all users with pagination and search
   */
  async getAllUser({
    page,
    limit,
    search,
    role,
    user_id,
  }: TList & { role: EUserRole; user_id: string }) {
    const where: Prisma.UserWhereInput = { role, id: { not: user_id } };

    if (search)
      where.OR = searchFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));

    const users = await prisma.user.findMany({
      where,
      omit: userSelfOmit[role],
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      users,
    };
  },

  async getUserById({
    userId,
    omit = undefined,
  }: {
    userId: string;
    omit?: Prisma.UserOmit;
  }) {
    return prisma.user.findUnique({
      where: { id: userId },
      omit,
    });
  },

  async getUsersCount() {
    const counts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true,
      },
    });

    return Object.fromEntries(
      counts.map(({ role, _count }) => [role, _count._all]),
    );
  },

  async deleteAccount(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.avatar) await deleteFilesQueue.add([user.avatar]);

    try {
      const deleted = await prisma.$transaction(async tx => {
        // Remove dependent records that block deletion
        await tx.ticket.deleteMany({ where: { user_id: userId } });
        await tx.transaction.deleteMany({ where: { user_id: userId } });

        // Finally delete the user
        return tx.user.delete({ where: { id: userId } });
      });

      return deleted;
    } catch (error) {
      // Translate FK violations into a user-friendly error
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).code === 'P2003'
      ) {
        throw new ServerError(
          StatusCodes.CONFLICT,
          'Account cannot be deleted due to existing linked records. Please remove related data first or contact support.',
        );
      }
      throw error;
    }
  },

  async updateAvailability({ availability, user_id }: TUpdateAvailability) {
    return prisma.user.update({
      where: { id: user_id },
      data: {
        availability,
      },
      select: { id: true },
    });
  },
};
