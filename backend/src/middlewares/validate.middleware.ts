import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { ApiError } from '../utils/api-error';

interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

function formatZodError(error: ZodError): { path: string; message: string }[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

/**
 * Validates and replaces req.body/params/query with parsed (typed, normalised)
 * data. Controllers must read from these instead of trusting raw input.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        // Express 5 exposes req.query as a getter-only property; store parsed
        // value where controllers can read it.
        Object.defineProperty(req, 'validatedQuery', {
          value: parsed,
          writable: true,
          configurable: true,
          enumerable: false,
        });
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(ApiError.validation('Validation failed', formatZodError(error)));
        return;
      }
      next(error);
    }
  };
}

/** Helper to read parsed query data attached by `validate`. */
export function getValidatedQuery<T>(req: Request): T {
  return (req as unknown as { validatedQuery: T }).validatedQuery;
}
