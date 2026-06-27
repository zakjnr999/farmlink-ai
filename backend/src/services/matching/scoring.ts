import { DISTANCE_SCORE_BANDS, MATCH_WEIGHTS, NEUTRAL_SCORE } from '../../constants/matching';
import { haversineDistanceKm } from '../../utils/distance';

export interface ScoringDemand {
  categoryId: string;
  minimumQuantity: number;
  maximumQuantity: number | null;
  preferredPriceMaximum: number | null;
  requiredFrom: Date | null;
  requiredUntil: Date | null;
  unit: string;
}

export interface ScoringListing {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  quantity: number;
  pricePerUnit: number | null;
  latitude: number;
  longitude: number;
  availableFrom: Date;
  availableUntil: Date | null;
}

export interface ScoringBuyer {
  businessName: string;
  latitude: number;
  longitude: number;
  maximumTravelDistanceKm: number;
  minimumOrderQuantity: number | null;
  preferredProduce: string[];
  demands: ScoringDemand[];
}

export interface MatchScore {
  score: number;
  produceScore: number;
  quantityScore: number;
  distanceScore: number;
  dateScore: number;
  priceScore: number;
  distanceKm: number;
  explanation: string;
  activeDemand: ScoringDemand | null;
}

export function scoreProduce(
  listing: ScoringListing,
  buyer: ScoringBuyer,
): { score: number; activeDemand: ScoringDemand | null } {
  const activeDemand = buyer.demands.find((d) => d.categoryId === listing.categoryId) ?? null;
  if (activeDemand) return { score: 100, activeDemand };

  const slug = listing.categorySlug.toLowerCase();
  const name = listing.categoryName.toLowerCase();
  const preferred = buyer.preferredProduce.map((p) => p.toLowerCase());
  if (preferred.some((p) => p === slug || p === name || p.includes(name) || name.includes(p))) {
    return { score: 70, activeDemand: null };
  }
  return { score: 10, activeDemand: null };
}

export function scoreQuantity(
  listingQty: number,
  demand: ScoringDemand | null,
  buyerMoq: number | null,
): number {
  if (!demand) {
    if (buyerMoq && listingQty < buyerMoq) return 30;
    return NEUTRAL_SCORE;
  }
  const min = demand.minimumQuantity;
  const max = demand.maximumQuantity;
  if (listingQty < min) return Math.max(20, Math.round((listingQty / min) * 60));
  if (max !== null && listingQty > max) return 80;
  return 100;
}

export function scoreDistance(distanceKm: number, maxTravelKm: number): number {
  if (distanceKm > maxTravelKm) return 0;
  for (const band of DISTANCE_SCORE_BANDS) {
    if (distanceKm <= band.maxKm) return band.score;
  }
  return 20;
}

export function scoreDate(listing: ScoringListing, demand: ScoringDemand | null): number {
  if (!demand || (!demand.requiredFrom && !demand.requiredUntil)) return NEUTRAL_SCORE;
  const availableFrom = listing.availableFrom.getTime();
  const availableUntil = listing.availableUntil?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const requiredFrom = demand.requiredFrom?.getTime() ?? Number.MIN_SAFE_INTEGER;
  const requiredUntil = demand.requiredUntil?.getTime() ?? Number.MAX_SAFE_INTEGER;

  const overlaps = availableFrom <= requiredUntil && availableUntil >= requiredFrom;
  if (overlaps) return 100;

  const gapMs =
    availableFrom > requiredUntil ? availableFrom - requiredUntil : requiredFrom - availableUntil;
  const gapDays = gapMs / (1000 * 60 * 60 * 24);
  if (gapDays <= 3) return 70;
  if (gapDays <= 7) return 45;
  return 20;
}

export function scorePrice(listingPrice: number | null, demand: ScoringDemand | null): number {
  if (listingPrice === null || !demand || demand.preferredPriceMaximum === null) {
    return NEUTRAL_SCORE;
  }
  const max = demand.preferredPriceMaximum;
  if (listingPrice <= max) return 100;
  const overshootRatio = (listingPrice - max) / max;
  if (overshootRatio <= 0.1) return 75;
  if (overshootRatio <= 0.25) return 50;
  if (overshootRatio <= 0.5) return 25;
  return 5;
}

function buildExplanation(
  listing: ScoringListing,
  buyer: ScoringBuyer,
  demand: ScoringDemand | null,
  distanceKm: number,
  produceScore: number,
  dateScore: number,
  priceScore: number,
): string {
  const parts: string[] = [];
  const produce = listing.categoryName.toLowerCase();
  if (demand) {
    const range = demand.maximumQuantity
      ? `${demand.minimumQuantity}–${demand.maximumQuantity}`
      : `${demand.minimumQuantity}+`;
    parts.push(
      `${buyer.businessName} regularly purchases ${produce} and requires ${range} ${demand.unit.toLowerCase()}`,
    );
  } else if (produceScore >= 70) {
    parts.push(`${buyer.businessName} lists ${produce} among preferred produce`);
  } else {
    parts.push(`${buyer.businessName} has no direct demand for ${produce}`);
  }
  parts.push(`is located ${distanceKm} km away`);
  if (dateScore >= 70) parts.push('needs delivery within the listing’s availability period');
  if (listing.pricePerUnit && priceScore >= 75) parts.push('the asking price is within budget');
  return `${parts.join(', ')}.`;
}

/** Pure weighted scoring for a single (listing, buyer) pair. */
export function scoreMatch(listing: ScoringListing, buyer: ScoringBuyer): MatchScore {
  const distanceKm = haversineDistanceKm(
    { latitude: listing.latitude, longitude: listing.longitude },
    { latitude: buyer.latitude, longitude: buyer.longitude },
  );

  const { score: produceScore, activeDemand } = scoreProduce(listing, buyer);
  const quantityScore = scoreQuantity(listing.quantity, activeDemand, buyer.minimumOrderQuantity);
  const distanceScore = scoreDistance(distanceKm, buyer.maximumTravelDistanceKm);
  const dateScore = scoreDate(listing, activeDemand);
  const priceScore = scorePrice(listing.pricePerUnit, activeDemand);

  const total =
    produceScore * MATCH_WEIGHTS.produce +
    quantityScore * MATCH_WEIGHTS.quantity +
    distanceScore * MATCH_WEIGHTS.distance +
    dateScore * MATCH_WEIGHTS.date +
    priceScore * MATCH_WEIGHTS.price;

  return {
    score: Math.round(total * 100) / 100,
    produceScore,
    quantityScore,
    distanceScore,
    dateScore,
    priceScore,
    distanceKm,
    activeDemand,
    explanation: buildExplanation(
      listing,
      buyer,
      activeDemand,
      distanceKm,
      produceScore,
      dateScore,
      priceScore,
    ),
  };
}
