import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export interface AuditEntry {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Records important administrative actions and major status changes. */
export const auditService = {
  async record(entry: AuditEntry, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.auditLog.create({
      data: {
        actorUserId: entry.actorUserId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata ?? Prisma.JsonNull,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  },
};
