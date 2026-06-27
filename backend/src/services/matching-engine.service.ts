import {
  RecommendationStatus,
  type BuyerDemand,
  type BuyerProfile,
  type ProduceCategory,
  type ProduceListing,
} from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { MIN_RECOMMENDATION_SCORE } from '../constants/matching';
import { scoreMatch, type ScoringDemand } from './matching/scoring';

type ListingWithCategory = ProduceListing & { category: ProduceCategory };
type BuyerWithDemands = BuyerProfile & { demands: BuyerDemand[] };

export interface ScoredMatch {
  buyerId: string;
  score: number;
  produceScore: number;
  quantityScore: number;
  distanceScore: number;
  dateScore: number;
  priceScore: number;
  distanceKm: number;
  explanation: string;
}

function toScoringDemand(demand: BuyerDemand): ScoringDemand {
  return {
    categoryId: demand.categoryId,
    minimumQuantity: Number(demand.minimumQuantity),
    maximumQuantity: demand.maximumQuantity !== null ? Number(demand.maximumQuantity) : null,
    preferredPriceMaximum:
      demand.preferredPriceMaximum !== null ? Number(demand.preferredPriceMaximum) : null,
    requiredFrom: demand.requiredFrom,
    requiredUntil: demand.requiredUntil,
    unit: demand.unit,
  };
}

export const matchingEngineService = {
  /**
   * Generate (or refresh) buyer recommendations for a listing using a
   * transparent weighted scoring algorithm. Idempotent: upserts on the unique
   * (listingId, buyerId) pair so re-running does not create duplicates.
   */
  async generateMatchesForListing(listingId: string): Promise<ScoredMatch[]> {
    const listing = (await prisma.produceListing.findUnique({
      where: { id: listingId },
      include: { category: true },
    })) as ListingWithCategory | null;

    if (!listing) throw new Error(`Listing ${listingId} not found for matching`);

    const buyers = (await prisma.buyerProfile.findMany({
      include: { demands: { where: { isActive: true } } },
    })) as BuyerWithDemands[];

    const scoringListing = {
      categoryId: listing.categoryId,
      categoryName: listing.category.name,
      categorySlug: listing.category.slug,
      quantity: Number(listing.quantity),
      pricePerUnit: listing.pricePerUnit !== null ? Number(listing.pricePerUnit) : null,
      latitude: listing.latitude,
      longitude: listing.longitude,
      availableFrom: listing.availableFrom,
      availableUntil: listing.availableUntil,
    };

    const scored: ScoredMatch[] = [];
    for (const buyer of buyers) {
      const result = scoreMatch(scoringListing, {
        businessName: buyer.businessName,
        latitude: buyer.latitude,
        longitude: buyer.longitude,
        maximumTravelDistanceKm: Number(buyer.maximumTravelDistanceKm),
        minimumOrderQuantity:
          buyer.minimumOrderQuantity !== null ? Number(buyer.minimumOrderQuantity) : null,
        preferredProduce: buyer.preferredProduce,
        demands: buyer.demands.map(toScoringDemand),
      });

      if (result.score < MIN_RECOMMENDATION_SCORE) continue;

      scored.push({
        buyerId: buyer.id,
        score: result.score,
        produceScore: result.produceScore,
        quantityScore: result.quantityScore,
        distanceScore: result.distanceScore,
        dateScore: result.dateScore,
        priceScore: result.priceScore,
        distanceKm: result.distanceKm,
        explanation: result.explanation,
      });
    }

    scored.sort((a, b) => b.score - a.score);

    await prisma.$transaction(
      scored.map((match) =>
        prisma.matchRecommendation.upsert({
          where: { listingId_buyerId: { listingId, buyerId: match.buyerId } },
          create: {
            listingId,
            buyerId: match.buyerId,
            score: match.score,
            produceScore: match.produceScore,
            quantityScore: match.quantityScore,
            distanceScore: match.distanceScore,
            dateScore: match.dateScore,
            priceScore: match.priceScore,
            explanation: match.explanation,
            status: RecommendationStatus.RECOMMENDED,
          },
          // On update we refresh scores/explanation but intentionally leave
          // `status` untouched, preserving terminal states (e.g. CONVERTED,
          // DISMISSED) so re-running matching never resurrects them.
          update: {
            score: match.score,
            produceScore: match.produceScore,
            quantityScore: match.quantityScore,
            distanceScore: match.distanceScore,
            dateScore: match.dateScore,
            priceScore: match.priceScore,
            explanation: match.explanation,
          },
        }),
      ),
    );

    logger.info({ listingId, matches: scored.length }, 'Generated match recommendations');
    return scored;
  },
};
