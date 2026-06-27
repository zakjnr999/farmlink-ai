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
  users: { total: number; farmers: number; buyers: number; admins: number };
  listings: { total: number; published: number; draft: number };
  offers: { total: number; pending: number; accepted: number };
  transactions: { total: number; completed: number };
}

export interface FarmerOffer extends Offer {
  listing?: ProduceListing;
  buyerName?: string;
}
