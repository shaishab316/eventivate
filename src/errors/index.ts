import { statusCodes } from '@/lib/status_codes';
import ServerError from './ServerError';

export * from './ServerError';
export * from './handleZodError';

export const notFoundError = (url: string) =>
	new ServerError(statusCodes.NOT_FOUND, `Route not found. ${url}`);
