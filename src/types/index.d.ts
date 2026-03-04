import type { MSafeUser } from "@/modules/user/User.interface";

/**
 * Type for nullable values.
 */
type Nullable<T> = T | null;

declare global {
  namespace Express {
    interface Request {
      user: MSafeUser;
      tempFiles: string[];
    }
  }
}
