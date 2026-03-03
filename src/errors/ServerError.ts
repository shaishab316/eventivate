/**
 * Custom error class for server-side errors
 *
 * This class extends the built-in Error class and provides a custom error message
 * and stack trace for server-side errors.
 */
export class ServerError extends Error {
	constructor(
		public readonly statusCode: number,
		message = 'An error occurred',
		stack?: string,
	) {
		super(message);
		this.name = 'ServerError';

		if (stack) this.stack = stack;
		else Error.captureStackTrace(this, this.constructor);
	}
}

export default ServerError;
