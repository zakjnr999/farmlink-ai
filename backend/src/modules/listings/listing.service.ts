import dayjs from 'dayjs';
import { ListingStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/api-error';
import { resolvePagination } from '../../utils/pagination';
import { haversineDistanceKm } from '../../utils/distance';
import { auditService } from '../../services/audit.service';
import { aiExtractionService } from '../../services/ai-extraction.service';
import { matchingEngineService } from '../../services/matching-engine.service';
import { transportService } from '../../services/transport.service';
import { farmerService } from '../farmers/farmer.service';
import type {
  CreateListingInput,
  ExtractInput,
  MarketplaceQuery,
  MyListingsQuery,
  UpdateListingInput,
} from './listing.schema';

const EDITABLE_STATES: ListingStatus[] = [ListingStatus.DRAFT, ListingStatus.PUBLISHED];
const MARKETPLACE_STATES: ListingStatus[] = [
  ListingStatus.PUBLISHED,
  ListingStatus.PARTIALLY_RESERVED,
];

interface ActorContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const listingService = {
  async extract(input: ExtractInput) {
    const referenceDate = input.referenceDate ?? dayjs().format('YYYY-MM-DD');
    const result = await aiExtractionService.extract({ text: input.text, referenceDate });

    // Attempt to map produce slug to an existing category for convenience.
    let suggestedCategoryId: string | null = null;
    if (result.produceSlug) {
      const category = await prisma.produceCategory.findUnique({
        where: { slug: result.produceSlug },
        select: { id: true },
      });
      suggestedCategoryId = category?.id ?? null;
    }

    return { ...result, referenceDate, suggestedCategoryId };
  },

  async createListing(farmerUserId: string, input: CreateListingInput) {
    const farmerId = await farmerService.requireProfileId(farmerUserId);
    const category = await prisma.produceCategory.findUnique({ where: { id: input.categoryId } });
    if (!category || !category.isActive) {
      throw ApiError.badRequest('Unknown or inactive produce category');
    }

    return prisma.produceListing.create({
      data: {
        farmerId,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        quantity: new Prisma.Decimal(input.quantity),
        unit: input.unit,
        minimumOrderQuantity: new Prisma.Decimal(input.minimumOrderQuantity),
        pricePerUnit:
          input.pricePerUnit !== undefined ? new Prisma.Decimal(input.pricePerUnit) : null,
        currency: input.currency,
        harvestDate: input.harvestDate,
        availableFrom: input.availableFrom,
        availableUntil: input.availableUntil ?? null,
        qualityGrade: input.qualityGrade ?? null,
        farmingMethod: input.farmingMethod ?? null,
        region: input.region,
        district: input.district,
        town: input.town,
        latitude: input.latitude,
        longitude: input.longitude,
        sourceType: input.sourceType,
        rawInputText: input.rawInputText ?? null,
        aiExtractionConfidence: input.aiExtractionConfidence ?? null,
        transportPoolEligible: input.transportPoolEligible,
        status: ListingStatus.DRAFT,
      },
      include: { category: { select: { name: true, slug: true } } },
    });
  },

  async getOwnedListing(farmerUserId: string, listingId: string) {
    const listing = await prisma.produceListing.findFirst({
      where: { id: listingId, farmer: { userId: farmerUserId } },
      include: { category: { select: { name: true, slug: true } } },
    });
    if (!listing) throw ApiError.notFound('Listing not found');
    return listing;
  },

  async listMine(farmerUserId: string, query: MyListingsQuery) {
    const farmerId = await farmerService.requireProfileId(farmerUserId);
    const { skip, take, page, limit } = resolvePagination(query);
    const where: Prisma.ProduceListingWhereInput = {
      farmerId,
      ...(query.status ? { status: query.status as ListingStatus } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.produceListing.findMany({
        where,
        orderBy: { createdAt: query.sortOrder },
        skip,
        take,
        include: { category: { select: { name: true, slug: true } } },
      }),
      prisma.produceListing.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async updateListing(farmerUserId: string, listingId: string, input: UpdateListingInput) {
    const listing = await this.getOwnedListing(farmerUserId, listingId);
    if (!EDITABLE_STATES.includes(listing.status)) {
      throw ApiError.badRequest(`A listing in ${listing.status} state cannot be edited`);
    }

    if (input.quantity !== undefined && input.quantity < Number(listing.reservedQuantity)) {
      throw ApiError.badRequest('Quantity cannot be lower than the already reserved quantity');
    }

    const data: Prisma.ProduceListingUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.quantity !== undefined) data.quantity = new Prisma.Decimal(input.quantity);
    if (input.unit !== undefined) data.unit = input.unit;
    if (input.minimumOrderQuantity !== undefined)
      data.minimumOrderQuantity = new Prisma.Decimal(input.minimumOrderQuantity);
    if (input.pricePerUnit !== undefined)
      data.pricePerUnit = new Prisma.Decimal(input.pricePerUnit);
    if (input.harvestDate !== undefined) data.harvestDate = input.harvestDate;
    if (input.availableFrom !== undefined) data.availableFrom = input.availableFrom;
    if (input.availableUntil !== undefined) data.availableUntil = input.availableUntil;
    if (input.qualityGrade !== undefined) data.qualityGrade = input.qualityGrade;
    if (input.farmingMethod !== undefined) data.farmingMethod = input.farmingMethod;
    if (input.region !== undefined) data.region = input.region;
    if (input.district !== undefined) data.district = input.district;
    if (input.town !== undefined) data.town = input.town;
    if (input.latitude !== undefined) data.latitude = input.latitude;
    if (input.longitude !== undefined) data.longitude = input.longitude;
    if (input.transportPoolEligible !== undefined)
      data.transportPoolEligible = input.transportPoolEligible;

    return prisma.produceListing.update({
      where: { id: listingId },
      data,
      include: { category: { select: { name: true, slug: true } } },
    });
  },

  async publishListing(farmerUserId: string, listingId: string, ctx: ActorContext = {}) {
    const listing = await this.getOwnedListing(farmerUserId, listingId);
    if (listing.status !== ListingStatus.DRAFT) {
      throw ApiError.badRequest('Only draft listings can be published');
    }

    const published = await prisma.produceListing.update({
      where: { id: listingId },
      data: { status: ListingStatus.PUBLISHED, publishedAt: new Date() },
      include: { category: { select: { name: true, slug: true } } },
    });

    await auditService.record({
      actorUserId: farmerUserId,
      action: 'LISTING_PUBLISHED',
      entityType: 'ProduceListing',
      entityId: listingId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    // Trigger matching + transport pooling. Failures here must not block publish.
    try {
      await matchingEngineService.generateMatchesForListing(listingId);
    } catch (error) {
      logger.error({ err: error, listingId }, 'Match generation failed after publish');
    }
    try {
      await transportService.generateForListing(listingId);
    } catch (error) {
      logger.error({ err: error, listingId }, 'Transport suggestion generation failed');
    }

    return published;
  },

  async cancelListing(farmerUserId: string, listingId: string, ctx: ActorContext = {}) {
    const listing = await this.getOwnedListing(farmerUserId, listingId);
    const noncancellable: ListingStatus[] = [ListingStatus.SOLD, ListingStatus.CANCELLED];
    if (noncancellable.includes(listing.status)) {
      throw ApiError.badRequest(`A ${listing.status} listing cannot be cancelled`);
    }
    const cancelled = await prisma.produceListing.update({
      where: { id: listingId },
      data: { status: ListingStatus.CANCELLED },
      include: { category: { select: { name: true, slug: true } } },
    });
    await auditService.record({
      actorUserId: farmerUserId,
      action: 'LISTING_CANCELLED',
      entityType: 'ProduceListing',
      entityId: listingId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return cancelled;
  },

  async getMatchesForOwnedListing(farmerUserId: string, listingId: string) {
    await this.getOwnedListing(farmerUserId, listingId);
    return prisma.matchRecommendation.findMany({
      where: { listingId },
      orderBy: { score: 'desc' },
      include: {
        buyer: {
          select: { id: true, businessName: true, buyerType: true, region: true, town: true },
        },
      },
    });
  },

  // --- Marketplace (public, published listings) ----------------------------

  async marketplaceSearch(query: MarketplaceQuery) {
    const { skip, take, page, limit } = resolvePagination(query);

    const where: Prisma.ProduceListingWhereInput = {
      status: { in: MARKETPLACE_STATES },
      ...(query.region ? { region: { equals: query.region, mode: 'insensitive' } } : {}),
      ...(query.district ? { district: { equals: query.district, mode: 'insensitive' } } : {}),
      ...(query.town ? { town: { equals: query.town, mode: 'insensitive' } } : {}),
      ...(query.unit ? { unit: query.unit } : {}),
      ...(query.minQuantity !== undefined ? { quantity: { gte: query.minQuantity } } : {}),
      ...(query.maxPrice !== undefined ? { pricePerUnit: { lte: query.maxPrice } } : {}),
      ...(query.availableFrom ? { availableFrom: { lte: query.availableFrom } } : {}),
      ...(query.harvestDateFrom || query.harvestDateTo
        ? {
            harvestDate: {
              ...(query.harvestDateFrom ? { gte: query.harvestDateFrom } : {}),
              ...(query.harvestDateTo ? { lte: query.harvestDateTo } : {}),
            },
          }
        : {}),
      ...(query.category
        ? {
            category: {
              OR: [
                { slug: { equals: query.category, mode: 'insensitive' } },
                { name: { equals: query.category, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const useDistance =
      query.latitude !== undefined && query.longitude !== undefined && query.maxDistanceKm;

    // When filtering by distance we fetch a wider set then filter in memory.
    const findArgs: Prisma.ProduceListingFindManyArgs = {
      where,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: { category: { select: { name: true, slug: true } } },
    };

    if (useDistance) {
      const all = await prisma.produceListing.findMany(findArgs);
      const origin = { latitude: query.latitude!, longitude: query.longitude! };
      const withinRange = all
        .map((l) => ({
          listing: l,
          distanceKm: haversineDistanceKm(origin, { latitude: l.latitude, longitude: l.longitude }),
        }))
        .filter((entry) => entry.distanceKm <= query.maxDistanceKm!);
      const total = withinRange.length;
      const paged = withinRange.slice(skip, skip + take);
      return {
        items: paged.map((entry) => ({ ...entry.listing, distanceKm: entry.distanceKm })),
        total,
        page,
        limit,
      };
    }

    const [items, total] = await Promise.all([
      prisma.produceListing.findMany({ ...findArgs, skip, take }),
      prisma.produceListing.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async marketplaceGetById(listingId: string) {
    const listing = await prisma.produceListing.findFirst({
      where: { id: listingId, status: { in: MARKETPLACE_STATES } },
      include: {
        category: { select: { name: true, slug: true } },
        farmer: {
          select: {
            farmName: true,
            region: true,
            district: true,
            town: true,
            verificationStatus: true,
          },
        },
      },
    });
    if (!listing) throw ApiError.notFound('Listing not found or not available');
    return listing;
  },
};
