import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { logger } from './config/logger';
import { swaggerSpec } from './config/swagger';
import { requestId } from './middlewares/request-id.middleware';
import { generalRateLimiter } from './middlewares/rate-limit.middleware';
import { notFound } from './middlewares/not-found.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { apiRouter } from './routes';
import { healthRouter } from './modules/health/health.routes';
import { isAllowedCorsOrigin } from './utils/cors-origin';

export function createApp(): Application {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(requestId);
  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction ? undefined : false,
    }),
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        // Same-origin or server-to-server requests may omit Origin.
        if (!origin || isAllowedCorsOrigin(origin, env.corsOrigins)) {
          callback(null, true);
          return;
        }
        logger.warn({ origin, allowedOrigins: env.corsOrigins }, 'CORS origin rejected');
        callback(null, false);
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as { id?: string }).id ?? 'unknown',
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      autoLogging: !env.isTest,
    }),
  );

  app.use(generalRateLimiter);

  // Top-level health (outside the versioned API).
  app.use('/health', healthRouter);

  // API documentation.
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get('/api/docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  // Versioned API.
  app.use('/api/v1', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
