import { ZodError } from 'zod';
import { TErrorMessage } from '@/types/errors';
import { statusCodes } from '@/lib/status_codes';

export const handleZodError = ({ issues }: ZodError) => {
	const errorMessages: TErrorMessage[] = issues.map(({ path, message }) => ({
		path: path[path.length - 1] as string,
		message,
	}));

	return {
		statusCode: statusCodes.BAD_REQUEST,
		message: 'Request validation error',
		errorMessages,
	};
};
