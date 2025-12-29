import jwt from 'jsonwebtoken';
import config from '../../../config';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { errorLogger } from '../../../utils/logger';
import chalk from 'chalk';
import bcrypt from 'bcryptjs';
import { enum_decode } from '../../../utils/transform/enum';
import { TToken, TTokenPayload } from '../../../types/auth.types';
import rateLimit from 'express-rate-limit';
import ms from 'ms';
import { formatError } from '../../middlewares/globalErrorHandler';

/**
 * Create a token
 * @param payload - The payload to sign
 * @param token_type - The type of token to create
 * @returns The signed token
 */
export const encodeToken = (payload: TTokenPayload, token_type: TToken) => {
  Object.assign(payload, { token_type });

  try {
    return jwt.sign(payload, config.jwt[token_type].secret, {
      expiresIn: config.jwt[token_type].expire_in,
    });
  } catch (error: any) {
    errorLogger.error(chalk.red('🔑 Failed to create token'), error);
    throw new ServerError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create token ::=> ' + error.message,
    );
  }
};

/**
 * Verify a token with improved error handling
 * @param token - The token to verify
 * @param token_type - The type of token to verify
 * @returns The decoded token
 */
export const decodeToken = (token: string | undefined, token_type: TToken) => {
  token = token?.trim()?.match(/[\w-]+\.[\w-]+\.[\w-]+/)?.[0];
  const error = new ServerError(
    StatusCodes.UNAUTHORIZED,
    `Please provide a valid ${enum_decode(token_type)}.`,
  );

  if (!token) throw error;

  try {
    return jwt.verify(token, config.jwt[token_type].secret) as TTokenPayload;
  } catch {
    throw error;
  }
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(config.bcrypt_salt_rounds);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const authRateLimiter = rateLimit({
  windowMs: ms('5m'),
  max: 100,
  message: formatError(
    new ServerError(
      StatusCodes.TOO_MANY_REQUESTS,
      'Too many change password attempts. Try again in 5 minutes.',
    ),
  ),
});
