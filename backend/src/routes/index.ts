import { Router } from 'express';
import { env } from '../config/env';
import { isDatabaseHealthy } from '../config/database';
import { asyncHandler } from '../utils/async-handler';
import { authRouter } from '../modules/auth/auth.routes';
import { farmerRouter } from '../modules/farmers/farmer.routes';
import { buyerRouter } from '../modules/buyers/buyer.routes';
import { listingRouter, marketplaceRouter } from '../modules/listings/listing.routes';
import { offerRouter } from '../modules/offers/offer.routes';
import { categoryRouter } from '../modules/categories/category.routes';
import { notificationRouter } from '../modules/notifications/notification.routes';
import { adminRouter } from '../modules/admin/admin.routes';

export const apiRouter = Router();

apiRouter.get(
  '/health',
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

apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/farmers', farmerRouter);
apiRouter.use('/buyers', buyerRouter);
apiRouter.use('/listings', listingRouter);
apiRouter.use('/marketplace', marketplaceRouter);
apiRouter.use('/offers', offerRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/admin', adminRouter);
