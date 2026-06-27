import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { resolvePagination } from '../../utils/pagination';
import type { PaginationParams } from '../../utils/pagination';

type ListQuery = { page?: number; limit?: number; sortOrder?: 'asc' | 'desc' };

function listArgs(query: ListQuery): PaginationParams & { order: 'asc' | 'desc' } {
  const pagination = resolvePagination(query);
  return { ...pagination, order: query.sortOrder ?? 'desc' };
}

export const transactionService = {
  async listForFarmer(farmerUserId: string, query: ListQuery) {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: farmerUserId },
      select: { id: true },
    });
    if (!farmer) throw ApiError.forbidden('You must create a farmer profile first');
    const { skip, take, page, limit, order } = listArgs(query);
    const where: Prisma.ProduceTransactionWhereInput = { farmerId: farmer.id };
    const [items, total] = await Promise.all([
      prisma.produceTransaction.findMany({ where, orderBy: { createdAt: order }, skip, take }),
      prisma.produceTransaction.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async listForBuyer(buyerUserId: string, query: ListQuery) {
    const buyer = await prisma.buyerProfile.findUnique({
      where: { userId: buyerUserId },
      select: { id: true },
    });
    if (!buyer) throw ApiError.forbidden('You must create a buyer profile first');
    const { skip, take, page, limit, order } = listArgs(query);
    const where: Prisma.ProduceTransactionWhereInput = { buyerId: buyer.id };
    const [items, total] = await Promise.all([
      prisma.produceTransaction.findMany({ where, orderBy: { createdAt: order }, skip, take }),
      prisma.produceTransaction.count({ where }),
    ]);
    return { items, total, page, limit };
  },
};
