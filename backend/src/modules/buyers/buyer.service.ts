import { Prisma, RecommendationStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { resolvePagination } from '../../utils/pagination';
import { decimalToNumber } from '../../utils/decimal';
import type {
  CreateBuyerProfileInput,
  CreateDemandInput,
  RecommendationsQuery,
  UpdateBuyerProfileInput,
  UpdateDemandInput,
} from './buyer.schema';

function buildOptional<T extends object>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export const buyerService = {
  async getProfileByUserId(userId: string) {
    const profile = await prisma.buyerProfile.findUnique({ where: { userId } });
    if (!profile) throw ApiError.notFound('Buyer profile not found. Create one first.');
    return profile;
  },

  async requireProfileId(userId: string): Promise<string> {
    const profile = await prisma.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) throw ApiError.forbidden('You must create a buyer profile first');
    return profile.id;
  },

  async createProfile(userId: string, input: CreateBuyerProfileInput) {
    const existing = await prisma.buyerProfile.findUnique({ where: { userId } });
    if (existing) throw ApiError.conflict('Buyer profile already exists; use update instead');
    return prisma.buyerProfile.create({
      data: {
        userId,
        businessName: input.businessName,
        buyerType: input.buyerType,
        description: input.description ?? null,
        region: input.region,
        district: input.district,
        town: input.town,
        latitude: input.latitude,
        longitude: input.longitude,
        preferredProduce: input.preferredProduce ?? [],
        minimumOrderQuantity: input.minimumOrderQuantity ?? null,
        maximumTravelDistanceKm: input.maximumTravelDistanceKm,
      },
    });
  },

  async updateProfile(userId: string, input: UpdateBuyerProfileInput) {
    await this.getProfileByUserId(userId);
    return prisma.buyerProfile.update({
      where: { userId },
      data: buildOptional(input),
    });
  },

  // --- Demands -------------------------------------------------------------

  async createDemand(userId: string, input: CreateDemandInput) {
    const buyerId = await this.requireProfileId(userId);
    const category = await prisma.produceCategory.findUnique({ where: { id: input.categoryId } });
    if (!category) throw ApiError.badRequest('Unknown produce category');
    return prisma.buyerDemand.create({
      data: {
        buyerId,
        categoryId: input.categoryId,
        minimumQuantity: new Prisma.Decimal(input.minimumQuantity),
        maximumQuantity:
          input.maximumQuantity !== undefined ? new Prisma.Decimal(input.maximumQuantity) : null,
        unit: input.unit,
        preferredPriceMaximum:
          input.preferredPriceMaximum !== undefined
            ? new Prisma.Decimal(input.preferredPriceMaximum)
            : null,
        requiredFrom: input.requiredFrom ?? null,
        requiredUntil: input.requiredUntil ?? null,
        preferredRegions: input.preferredRegions ?? [],
        isRecurring: input.isRecurring,
        frequency: input.frequency ?? null,
        isActive: input.isActive,
      },
    });
  },

  async listDemands(userId: string) {
    const buyerId = await this.requireProfileId(userId);
    return prisma.buyerDemand.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true, slug: true } } },
    });
  },

  async updateDemand(userId: string, demandId: string, input: UpdateDemandInput) {
    const buyerId = await this.requireProfileId(userId);
    const demand = await prisma.buyerDemand.findFirst({ where: { id: demandId, buyerId } });
    if (!demand) throw ApiError.notFound('Demand not found');

    const data: Prisma.BuyerDemandUpdateInput = buildOptional({
      unit: input.unit,
      requiredFrom: input.requiredFrom,
      requiredUntil: input.requiredUntil,
      preferredRegions: input.preferredRegions,
      isRecurring: input.isRecurring,
      frequency: input.frequency,
      isActive: input.isActive,
    });
    if (input.categoryId !== undefined) data.category = { connect: { id: input.categoryId } };
    if (input.minimumQuantity !== undefined)
      data.minimumQuantity = new Prisma.Decimal(input.minimumQuantity);
    if (input.maximumQuantity !== undefined)
      data.maximumQuantity = new Prisma.Decimal(input.maximumQuantity);
    if (input.preferredPriceMaximum !== undefined)
      data.preferredPriceMaximum = new Prisma.Decimal(input.preferredPriceMaximum);

    return prisma.buyerDemand.update({ where: { id: demandId }, data });
  },

  async deleteDemand(userId: string, demandId: string) {
    const buyerId = await this.requireProfileId(userId);
    const demand = await prisma.buyerDemand.findFirst({ where: { id: demandId, buyerId } });
    if (!demand) throw ApiError.notFound('Demand not found');
    await prisma.buyerDemand.delete({ where: { id: demandId } });
  },

  // --- Recommendations -----------------------------------------------------

  async listRecommendations(userId: string, query: RecommendationsQuery) {
    const buyerId = await this.requireProfileId(userId);
    const { skip, take, page, limit } = resolvePagination(query);
    const where: Prisma.MatchRecommendationWhereInput = {
      buyerId,
      status: {
        in: [
          RecommendationStatus.RECOMMENDED,
          RecommendationStatus.VIEWED,
          RecommendationStatus.OFFERED,
        ],
      },
      ...(query.minScore !== undefined ? { score: { gte: query.minScore } } : {}),
      listing: { status: { in: ['PUBLISHED', 'PARTIALLY_RESERVED'] } },
    };
    const [items, total] = await Promise.all([
      prisma.matchRecommendation.findMany({
        where,
        orderBy: { score: query.sortOrder },
        skip,
        take,
        include: {
          listing: {
            include: { category: { select: { name: true, slug: true } } },
          },
        },
      }),
      prisma.matchRecommendation.count({ where }),
    ]);

    const serialized = items.map((rec) => ({
      ...rec,
      listing: {
        ...rec.listing,
        quantity: decimalToNumber(rec.listing.quantity),
        reservedQuantity: decimalToNumber(rec.listing.reservedQuantity),
        minimumOrderQuantity: decimalToNumber(rec.listing.minimumOrderQuantity),
        pricePerUnit: decimalToNumber(rec.listing.pricePerUnit),
      },
    }));

    return { items: serialized, total, page, limit };
  },
};
