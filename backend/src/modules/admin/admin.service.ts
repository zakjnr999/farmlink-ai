import dayjs from 'dayjs';
import {
  ListingStatus,
  NotificationType,
  OfferStatus,
  Prisma,
  TransactionStatus,
  UserRole,
  VerificationStatus,
} from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { resolvePagination } from '../../utils/pagination';
import { decimalToNumber } from '../../utils/decimal';
import { safeUserSelect } from '../users/user.serializer';
import { auditService } from '../../services/audit.service';
import { notificationService } from '../../services/notification.service';
import { matchingEngineService } from '../../services/matching-engine.service';
import type {
  AdminListingsQuery,
  AdminOffersQuery,
  AdminUsersQuery,
  UpdateListingStatusInput,
  UpdateUserStatusInput,
} from './admin.schema';

interface ActorContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const adminService = {
  async dashboard() {
    const soonThreshold = dayjs().add(3, 'day').toDate();

    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      verifiedFarmers,
      activeListings,
      listingsByCategory,
      listingsByRegion,
      pendingOffers,
      acceptedOffers,
      completedTransactions,
      transactionAggregate,
      successfulMatches,
      matchScoreAggregate,
      expiringListings,
      recentAudit,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.FARMER } }),
      prisma.user.count({ where: { role: UserRole.BUYER } }),
      prisma.farmerProfile.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
      prisma.produceListing.count({
        where: { status: { in: [ListingStatus.PUBLISHED, ListingStatus.PARTIALLY_RESERVED] } },
      }),
      prisma.produceListing.groupBy({
        by: ['categoryId'],
        _count: { _all: true },
        where: { status: { in: [ListingStatus.PUBLISHED, ListingStatus.PARTIALLY_RESERVED] } },
      }),
      prisma.produceListing.groupBy({
        by: ['region'],
        _count: { _all: true },
        where: { status: { in: [ListingStatus.PUBLISHED, ListingStatus.PARTIALLY_RESERVED] } },
      }),
      prisma.offer.count({ where: { status: OfferStatus.PENDING } }),
      prisma.offer.count({ where: { status: OfferStatus.ACCEPTED } }),
      prisma.produceTransaction.count({ where: { status: TransactionStatus.COMPLETED } }),
      prisma.produceTransaction.aggregate({ _sum: { totalAmount: true }, _count: { _all: true } }),
      prisma.matchRecommendation.count(),
      prisma.matchRecommendation.aggregate({ _avg: { score: true } }),
      prisma.produceListing.findMany({
        where: {
          status: { in: [ListingStatus.PUBLISHED, ListingStatus.PARTIALLY_RESERVED] },
          availableUntil: { not: null, lte: soonThreshold },
        },
        select: { id: true, title: true, availableUntil: true, region: true },
        take: 10,
        orderBy: { availableUntil: 'asc' },
      }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    // Resolve category names for the grouped counts.
    const categoryIds = listingsByCategory.map((c) => c.categoryId);
    const categories = await prisma.produceCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

    return {
      users: { total: totalUsers, farmers: totalFarmers, buyers: totalBuyers, verifiedFarmers },
      listings: {
        active: activeListings,
        byCategory: listingsByCategory.map((c) => ({
          category: categoryNameById.get(c.categoryId) ?? 'Unknown',
          count: c._count._all,
        })),
        byRegion: listingsByRegion.map((r) => ({ region: r.region, count: r._count._all })),
        expiringSoon: expiringListings,
      },
      offers: { pending: pendingOffers, accepted: acceptedOffers },
      transactions: {
        completed: completedTransactions,
        total: transactionAggregate._count._all,
        estimatedTotalValue: decimalToNumber(transactionAggregate._sum.totalAmount) ?? 0,
      },
      matching: {
        successfulMatches,
        averageScore: matchScoreAggregate._avg.score
          ? Math.round(matchScoreAggregate._avg.score * 100) / 100
          : 0,
      },
      recentActivity: recentAudit,
    };
  },

  async listUsers(query: AdminUsersQuery) {
    const { skip, take, page, limit } = resolvePagination(query);
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.accountStatus ? { accountStatus: query.accountStatus } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { phoneNumber: { contains: query.search } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: safeUserSelect,
        orderBy: { createdAt: query.sortOrder },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ...safeUserSelect, farmerProfile: true, buyerProfile: true },
    });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async updateUserStatus(
    adminId: string,
    userId: string,
    input: UpdateUserStatusInput,
    ctx: ActorContext = {},
  ) {
    if (adminId === userId) {
      throw ApiError.badRequest('Administrators cannot change their own account status');
    }
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!target) throw ApiError.notFound('User not found');
    if (target.role === UserRole.ADMIN) {
      throw ApiError.forbidden('Administrator accounts cannot be modified here');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: input.accountStatus },
      select: safeUserSelect,
    });

    await notificationService.create({
      userId,
      type: NotificationType.ACCOUNT_UPDATE,
      title: 'Account status updated',
      message: `Your account status is now ${input.accountStatus}.`,
      metadata: input.reason ? { reason: input.reason } : undefined,
    });

    await auditService.record({
      actorUserId: adminId,
      action: 'USER_STATUS_CHANGED',
      entityType: 'User',
      entityId: userId,
      metadata: { accountStatus: input.accountStatus, reason: input.reason },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return user;
  },

  async listListings(query: AdminListingsQuery) {
    const { skip, take, page, limit } = resolvePagination(query);
    const where: Prisma.ProduceListingWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.region ? { region: { equals: query.region, mode: 'insensitive' } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.produceListing.findMany({
        where,
        orderBy: { createdAt: query.sortOrder },
        skip,
        take,
        include: { category: { select: { name: true } }, farmer: { select: { farmName: true } } },
      }),
      prisma.produceListing.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async getListing(listingId: string) {
    const listing = await prisma.produceListing.findUnique({
      where: { id: listingId },
      include: {
        category: true,
        farmer: { select: { farmName: true, region: true, userId: true } },
      },
    });
    if (!listing) throw ApiError.notFound('Listing not found');
    return listing;
  },

  async updateListingStatus(
    adminId: string,
    listingId: string,
    input: UpdateListingStatusInput,
    ctx: ActorContext = {},
  ) {
    const exists = await prisma.produceListing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!exists) throw ApiError.notFound('Listing not found');
    const listing = await prisma.produceListing.update({
      where: { id: listingId },
      data: { status: input.status },
    });
    await auditService.record({
      actorUserId: adminId,
      action: 'LISTING_STATUS_CHANGED',
      entityType: 'ProduceListing',
      entityId: listingId,
      metadata: { status: input.status, reason: input.reason },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return listing;
  },

  async listOffers(query: AdminOffersQuery) {
    const { skip, take, page, limit } = resolvePagination(query);
    const where: Prisma.OfferWhereInput = query.status ? { status: query.status } : {};
    const [items, total] = await Promise.all([
      prisma.offer.findMany({ where, orderBy: { createdAt: query.sortOrder }, skip, take }),
      prisma.offer.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async listTransactions(query: AdminOffersQuery) {
    const { skip, take, page, limit } = resolvePagination(query);
    const [items, total] = await Promise.all([
      prisma.produceTransaction.findMany({ orderBy: { createdAt: query.sortOrder }, skip, take }),
      prisma.produceTransaction.count(),
    ]);
    return { items, total, page, limit };
  },

  async listMatches(query: AdminOffersQuery) {
    const { skip, take, page, limit } = resolvePagination(query);
    const [items, total] = await Promise.all([
      prisma.matchRecommendation.findMany({
        orderBy: { score: query.sortOrder },
        skip,
        take,
        include: {
          buyer: { select: { businessName: true } },
          listing: { select: { title: true } },
        },
      }),
      prisma.matchRecommendation.count(),
    ]);
    return { items, total, page, limit };
  },

  async regenerateMatches(adminId: string, listingId: string, ctx: ActorContext = {}) {
    const listing = await prisma.produceListing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) throw ApiError.notFound('Listing not found');
    const matches = await matchingEngineService.generateMatchesForListing(listingId);
    await auditService.record({
      actorUserId: adminId,
      action: 'MATCHES_REGENERATED',
      entityType: 'ProduceListing',
      entityId: listingId,
      metadata: { count: matches.length },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return matches;
  },

  async listAuditLogs(query: AdminOffersQuery) {
    const { skip, take, page, limit } = resolvePagination(query);
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ orderBy: { createdAt: query.sortOrder }, skip, take }),
      prisma.auditLog.count(),
    ]);
    return { items, total, page, limit };
  },
};
