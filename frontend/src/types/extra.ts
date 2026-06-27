import type { Offer, ProduceListing } from '../api/types';

export interface FarmerProfile {
  id: string;
  userId: string;
  farmName: string | null;
  region: string;
  district: string;
  town: string | null;
  village: string | null;
  latitude: number | null;
  longitude: number | null;
  primaryCrops: string[];
  bio: string | null;
  onboardingComplete: boolean;
}

export interface AdminDashboard {
  users: { total: number; farmers: number; buyers: number; verifiedFarmers?: number; admins?: number };
  listings: {
    active?: number;
    total?: number;
    published?: number;
    draft?: number;
    byCategory?: unknown[];
    byRegion?: unknown[];
  };
  offers: { pending: number; accepted: number; total?: number };
  transactions: { total: number; completed: number; estimatedTotalValue?: number };
  matching?: { successfulMatches: number; averageScore: number };
  recentActivity?: unknown[];
}

export interface FarmerOffer extends Offer {
  listing?: ProduceListing;
  buyerName?: string;
}
