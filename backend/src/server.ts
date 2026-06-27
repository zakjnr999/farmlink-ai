import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      `FarmLink API listening on http://localhost:${env.PORT}`,
    );
    logger.info(`API docs available at http://localhost:${env.PORT}/api/docs`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Shutting down gracefully');
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Force exit if not closed within 10s.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
