/**
 * Type for nullable values.
 */
type Nullable<T> = T | null;

declare global {
	namespace Express {
		interface Request {
			user: TUser;
			tempFiles: string[];
		}
	}
}
