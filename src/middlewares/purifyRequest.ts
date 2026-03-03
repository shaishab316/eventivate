/* eslint-disable no-unused-vars */
import { ZodObject } from "zod";
import catchAsync from "./catchAsync";
import { debuglog as debug } from "node:util";

const debuglog = debug("app:request");

const keys = ["body", "query", "params", "cookies"] as const;

/**
 * Middleware to validate and sanitize incoming Express requests using Zod schemas.
 *
 * Supports static and dynamic schemas (functions returning schemas).
 * Validates body, query, params, and cookies, then merges results into `req`.
 */
const purifyRequest = (...schemas: ZodObject[]) =>
  catchAsync(async (req, _, next) => {
    keys.forEach((key) => {
      req[key] ??= {}; // Ensure the property exists on req
    });

    const results = await Promise.all(
      schemas.map(async (schema) => schema.parseAsync(req)),
    );

    keys.forEach((key) => {
      const purified = Object.assign(
        {},
        ...results.map((result: any) => result?.[key] ?? {}),
      );

      //? Fix express 5 issue (req is read-only)
      Object.defineProperty(req, key, {
        value: purified,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    });

    next();

    keys.forEach((key) => debuglog(`${key} : %o`, req[key]));
  });

export default purifyRequest;
