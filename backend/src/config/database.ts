import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from './logger';

declare global {
  var __farmlinkPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__farmlinkPrisma ??
  new PrismaClient({
    log: env.isProduction ? ['error', 'warn'] : ['error', 'warn'],
  });

if (!env.isProduction) {
  global.__farmlinkPrisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('Database connection established');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
