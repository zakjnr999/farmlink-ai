import type { NextFunction, Request, Response } from 'express';
import { AccountStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Verifies the bearer token, loads the user, enforces an ACTIVE account status,
 * and attaches a minimal user object to the request.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw ApiError.unauthorized('Missing access token');
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, accountStatus: true },
    });

    if (!user) {
      throw ApiError.unauthorized('Account no longer exists');
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw ApiError.forbidden(`Account is ${user.accountStatus.toLowerCase()}`);
    }

    req.user = { id: user.id, role: user.role };
    next();
  },
);
