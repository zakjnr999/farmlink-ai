import jwt, { type SignOptions } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { ApiError } from './api-error';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof (decoded as Record<string, unknown>).sub !== 'string' ||
      typeof (decoded as Record<string, unknown>).role !== 'string'
    ) {
      throw ApiError.unauthorized('Invalid token payload');
    }
    const payload = decoded as unknown as AccessTokenPayload;
    return { sub: payload.sub, role: payload.role };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Invalid or expired token');
  }
}
