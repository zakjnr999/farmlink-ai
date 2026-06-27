import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@prisma/client';
import { ApiError } from '../utils/api-error';

/** Restricts a route to the provided roles. Must run after `authenticate`. */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('Your role is not permitted to access this resource');
    }
    next();
  };
}
