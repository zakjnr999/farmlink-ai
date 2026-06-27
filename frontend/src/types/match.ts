export type MatchLabel = 'excellent' | 'good' | 'fair' | 'low';

export interface BuyerMatch {
  id: string;
  buyerId: string;
  buyerName: string;
  listingId: string;
  score: number;
  label: MatchLabel;
  distanceKm?: number;
  region?: string;
  preferredQuantity?: number;
  preferredUnit?: string;
  notes?: string;
  createdAt: string;
}
