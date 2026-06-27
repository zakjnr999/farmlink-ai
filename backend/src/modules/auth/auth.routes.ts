import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rate-limit.middleware';
import { authController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);

authRouter.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);

authRouter.get('/me', authenticate, asyncHandler(authController.me));
