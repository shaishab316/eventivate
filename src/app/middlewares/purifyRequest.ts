/* eslint-disable no-unused-vars */
import type { Request } from 'express';
import { ZodObject } from 'zod';
import catchAsync from './catchAsync';
import config from '../../config';

const keys = ['body', 'query', 'params', 'cookies'] as const;

export type SchemaOrFn =
  | ZodObject
  | ((req: Request) => ZodObject | Promise<ZodObject>);

/**
 * Middleware to validate and sanitize incoming Express requests using Zod schemas.
 *
 * Supports static and dynamic schemas (functions returning schemas).
 * Validates body, query, params, and cookies, then merges results into `req`.
 */
const purifyRequest = (...schemas: SchemaOrFn[]) =>
  catchAsync(
    async (req, _, next) => {
      const results = await Promise.all(
        schemas.map(async schema => {
          const zodSchema =
            typeof schema === 'function' ? await schema(req) : schema;
          return zodSchema.parseAsync(req);
        }),
      );

      keys.forEach(key => {
        const purified = Object.assign(
          {},
          key === 'params' && req.params,
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
    },
    (error, req, _, next) => {
      if (config.server.isDevelopment)
        // eslint-disable-next-line no-console
        keys.forEach(key => console.log(`${key} :`, req[key]));

      next(error);
    },
  );

export default purifyRequest;
