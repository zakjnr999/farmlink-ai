import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { authService } from './auth.service';
import type { LoginInput, RegisterInput } from './auth.schema';

function requestContext(req: Request) {
  return {
    ipAddress: req.ip ?? null,
    userAgent: req.headers['user-agent'] ?? null,
  };
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body as RegisterInput, requestContext(req));
    sendSuccess(res, {
      statusCode: 201,
      message: 'Account created successfully',
      data: result,
    });
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body as LoginInput, requestContext(req));
    sendSuccess(res, { message: 'Logged in successfully', data: result });
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const user = await authService.getCurrentUser(req.user.id);
    sendSuccess(res, { message: 'Current user retrieved', data: { user } });
  },
};
