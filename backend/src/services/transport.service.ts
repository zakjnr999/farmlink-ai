import { ListingStatus, NotificationType, Prisma, TransportPoolStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { TRANSPORT_POOL_DATE_WINDOW_DAYS, TRANSPORT_POOL_RADIUS_KM } from '../constants/matching';
import { haversineDistanceKm } from '../utils/distance';
import { notificationService } from './notification.service';

const POOLABLE_STATES: ListingStatus[] = [
  ListingStatus.PUBLISHED,
  ListingStatus.PARTIALLY_RESERVED,
  ListingStatus.RESERVED,
];

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Lightweight transport pooling suggestion service. Finds another nearby listing
 * with produce available around the same date and (approximately) the same
 * delivery direction. This is a recommendation only — not a logistics platform.
 */
export const transportService = {
  async generateForListing(listingId: string) {
    const listing = await prisma.produceListing.findUnique({
      where: { id: listingId },
      include: { farmer: { select: { userId: true } } },
    });
    if (!listing || !listing.transportPoolEligible) return [];
    if (!POOLABLE_STATES.includes(listing.status)) return [];

    const windowStart = new Date(
      listing.availableFrom.getTime() - TRANSPORT_POOL_DATE_WINDOW_DAYS * DAY_MS,
    );
    const windowEnd = new Date(
      listing.availableFrom.getTime() + TRANSPORT_POOL_DATE_WINDOW_DAYS * DAY_MS,
    );

    const candidates = await prisma.produceListing.findMany({
      where: {
        id: { not: listing.id },
        farmerId: { not: listing.farmerId },
        transportPoolEligible: true,
        status: { in: POOLABLE_STATES },
        availableFrom: { gte: windowStart, lte: windowEnd },
      },
      include: { farmer: { select: { userId: true } } },
    });

    const created: { secondaryListingId: string; distanceKm: number }[] = [];

    for (const candidate of candidates) {
      const distanceKm = haversineDistanceKm(
        { latitude: listing.latitude, longitude: listing.longitude },
        { latitude: candidate.latitude, longitude: candidate.longitude },
      );
      if (distanceKm > TRANSPORT_POOL_RADIUS_KM) continue;

      const sameRegion = listing.region.toLowerCase() === candidate.region.toLowerCase();
      const destinationSimilarityScore = sameRegion ? 90 : 55;

      // Normalise ordering so (a,b) and (b,a) map to the same unique pair.
      const [primaryId, secondaryId] =
        listing.id < candidate.id ? [listing.id, candidate.id] : [candidate.id, listing.id];

      const explanation =
        `Another farmer is located ${distanceKm} km away with produce scheduled around the same date` +
        (sameRegion ? ' heading toward the same region' : '') +
        '. Combining transport may reduce delivery costs.';

      await prisma.transportPoolSuggestion.upsert({
        where: {
          primaryListingId_secondaryListingId: {
            primaryListingId: primaryId,
            secondaryListingId: secondaryId,
          },
        },
        create: {
          primaryListingId: primaryId,
          secondaryListingId: secondaryId,
          distanceBetweenFarmsKm: distanceKm,
          destinationSimilarityScore,
          estimatedSavingsPercentage: sameRegion ? 15 : null,
          explanation,
          status: TransportPoolStatus.SUGGESTED,
        },
        update: {
          distanceBetweenFarmsKm: distanceKm,
          destinationSimilarityScore,
          explanation,
        },
      });

      created.push({ secondaryListingId: candidate.id, distanceKm });

      await notificationService.create({
        userId: listing.farmer.userId,
        type: NotificationType.TRANSPORT_POOL_FOUND,
        title: 'Shared transport opportunity',
        message: explanation,
        metadata: { listingId: listing.id, partnerListingId: candidate.id },
      });
    }

    logger.info({ listingId, suggestions: created.length }, 'Transport pool suggestions generated');
    return created;
  },

  async listForFarmer(farmerUserId: string) {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: farmerUserId },
      select: { id: true },
    });
    if (!farmer) return [];

    const where: Prisma.TransportPoolSuggestionWhereInput = {
      OR: [
        { primaryListing: { farmerId: farmer.id } },
        { secondaryListing: { farmerId: farmer.id } },
      ],
    };
    return prisma.transportPoolSuggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        primaryListing: { select: { id: true, title: true, town: true, region: true } },
        secondaryListing: { select: { id: true, title: true, town: true, region: true } },
      },
    });
  },
};
