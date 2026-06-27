import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const handler = (
  _req: unknown,
  res: { status: (code: number) => { json: (body: unknown) => void } },
): void => {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later',
    error: { code: 'RATE_LIMITED' },
  });
};

/** General limiter applied across the API. */
export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  handler,
});

/** Stricter limiter for authentication endpoints. */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  handler,
});
