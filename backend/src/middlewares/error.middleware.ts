import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ApiError } from '../utils/api-error';
import type { ErrorBody } from '../types/api';

function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): ApiError {
  switch (error.code) {
    case 'P2002':
      return ApiError.conflict('A record with these unique fields already exists', {
        target: (error.meta?.target as string[]) ?? undefined,
      });
    case 'P2025':
      return ApiError.notFound('The requested record was not found');
    case 'P2003':
      return ApiError.badRequest('Related record constraint failed');
    default:
      return ApiError.internal('Database error');
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof ZodError) {
    apiError = ApiError.validation('Validation failed', err.issues);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    apiError = mapPrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    apiError = ApiError.badRequest('Invalid database query input');
  } else {
    apiError = ApiError.internal();
  }

  const requestId = String(req.id);
  const logPayload = {
    requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode: apiError.statusCode,
    code: apiError.code,
    err: apiError.isOperational ? undefined : err,
  };

  if (apiError.statusCode >= 500) {
    logger.error(logPayload, apiError.message);
  } else {
    logger.warn(logPayload, apiError.message);
  }

  const exposeDetails = apiError.isOperational || !env.isProduction;

  const body: ErrorBody = {
    success: false,
    message: exposeDetails ? apiError.message : 'An unexpected error occurred',
    error: {
      code: apiError.code,
      details: exposeDetails ? apiError.details : undefined,
    },
    requestId,
  };

  res.status(apiError.statusCode).json(body);
}
