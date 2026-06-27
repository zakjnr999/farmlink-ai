import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * In-app notification service. Designed so SMS/email/push adapters can be added
 * later by implementing additional `dispatch` channels — for the MVP we only
 * persist in-app notifications.
 */
export const notificationService = {
  async create(input: CreateNotificationInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    const notification = await client.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: input.metadata ?? Prisma.JsonNull,
      },
    });
    logger.debug({ userId: input.userId, type: input.type }, 'Notification created');
    return notification;
  },

  async list(userId: string, params: { skip: number; take: number; unreadOnly?: boolean }) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(params.unreadOnly ? { readAt: null } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.notification.count({ where }),
    ]);
    return { items, total };
  },

  async unreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, readAt: null } });
  },

  async markRead(userId: string, notificationId: string) {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count > 0;
  },

  async markAllRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  },
};
