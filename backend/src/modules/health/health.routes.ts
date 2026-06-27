import { Router } from 'express';
import { env } from '../../config/env';
import { isDatabaseHealthy } from '../../config/database';
import { asyncHandler } from '../../utils/async-handler';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const databaseHealthy = await isDatabaseHealthy();
    res.status(databaseHealthy ? 200 : 503).json({
      success: databaseHealthy,
      status: databaseHealthy ? 'healthy' : 'degraded',
      service: 'farmlink-api',
      database: databaseHealthy ? 'connected' : 'unavailable',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  }),
);
