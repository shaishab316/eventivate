import type { ZodObject } from "zod";
import catchAsync from "./catchAsync";
import { debuglog as debug } from "node:util";

const debuglog = debug("app:request");

const keys = ["body", "query", "params", "cookies"] as const;

/**
 * Middleware to validate and sanitize incoming Express requests using Zod schemas.
 * Validates body, query, params, and cookies, then merges result into `req`.
 */
export const purifyRequest = (schema: ZodObject) =>
  catchAsync(async (req, _, next) => {
    const result = await schema.parseAsync(req);

    keys.forEach((key) => {
      Object.defineProperty(req, key, {
        value: result?.[key] ?? {},
        writable: true,
        configurable: true,
        enumerable: true,
      });

      debuglog(`${key} : %o`, req[key]);
    });

    next();
  });
