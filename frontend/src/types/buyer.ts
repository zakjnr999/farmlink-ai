export type BuyerType =
  | 'restaurant'
  | 'hotel'
  | 'school'
  | 'supermarket'
  | 'market_trader'
  | 'wholesaler'
  | 'processor'
  | 'individual'
  | 'other';

export type DemandFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'seasonal'
  | 'custom';

export type DemandStatus =
  | 'active'
  | 'inactive'
  | 'partially_matched'
  | 'matched'
  | 'unmatched';

export interface BuyerProfile {
  id: string;
  userId: string;
  businessName: string;
  buyerType: BuyerType;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  region: string;
  district: string;
  town: string;
  gpsCoordinates?: { lat: number; lng: number };
  maxTravelDistanceKm?: number;
  preferredProduce: string[];
  commonUnits: string[];
  typicalQuantityMin?: number;
  typicalQuantityMax?: number;
  purchaseFrequency?: DemandFrequency;
  onboardingComplete: boolean;
  verificationStatus?: 'verified' | 'pending' | 'unverified';
  createdAt: string;
  updatedAt: string;
}

export interface BuyerProfileUpdate {
  businessName?: string;
  buyerType?: BuyerType;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  region?: string;
  district?: string;
  town?: string;
  gpsCoordinates?: { lat: number; lng: number };
  maxTravelDistanceKm?: number;
  preferredProduce?: string[];
  commonUnits?: string[];
  typicalQuantityMin?: number;
  typicalQuantityMax?: number;
  purchaseFrequency?: DemandFrequency;
}

export interface BuyerOnboardingData extends BuyerProfileUpdate {
  businessName: string;
  buyerType: BuyerType;
  region: string;
  district: string;
  town: string;
  preferredProduce: string[];
}

export interface BuyerDemand {
  id: string;
  buyerId: string;
  produceCategory: string;
  produceCategoryId?: string;
  quantityMin: number;
  quantityMax: number;
  unit: string;
  preferredMaxPrice?: number;
  currency: string;
  requiredFrom: string;
  requiredUntil?: string;
  preferredRegions: string[];
  isRecurring: boolean;
  frequency?: DemandFrequency;
  status: DemandStatus;
  matchingListingsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerDemandPayload {
  produceCategory: string;
  produceCategoryId?: string;
  quantityMin: number;
  quantityMax: number;
  unit: string;
  preferredMaxPrice?: number;
  requiredFrom: string;
  requiredUntil?: string;
  preferredRegions: string[];
  isRecurring: boolean;
  frequency?: DemandFrequency;
  status?: DemandStatus;
}

export interface MatchScoreBreakdown {
  produce: number;
  quantity: number;
  distance: number;
  date: number;
  price: number;
  total: number;
}

export interface BuyerRecommendation {
  id: string;
  demandId?: string;
  listingId: string;
  listingTitle: string;
  produceType: string;
  farmerId: string;
  farmerName: string;
  farmName?: string;
  farmerVerified: boolean;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  region: string;
  district: string;
  town?: string;
  distanceKm: number;
  harvestDate?: string;
  availableFrom: string;
  availableUntil?: string;
  score: number;
  scoreLabel: string;
  scoreBreakdown: MatchScoreBreakdown;
  explanation: string;
  status: 'new' | 'viewed' | 'offer_sent' | 'converted' | 'expired';
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmName?: string;
  farmerVerified: boolean;
  title: string;
  categoryId: string;
  categoryName?: string;
  produceType: string;
  quantity: number;
  availableQuantity?: number;
  minimumOrder?: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  description?: string;
  harvestDate?: string;
  availableFrom: string;
  availableUntil?: string;
  region: string;
  district: string;
  town?: string;
  distanceKm?: number;
  matchScore?: number;
  qualityGrade?: string;
  farmingMethod?: string;
  status: string;
  aiConfidence?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceFilters {
  search?: string;
  category?: string;
  region?: string;
  district?: string;
  town?: string;
  unit?: string;
  minQuantity?: number;
  maxPrice?: number;
  harvestFrom?: string;
  harvestUntil?: string;
  availableFrom?: string;
  availableUntil?: string;
  maxDistance?: number;
  verifiedOnly?: boolean;
  minMatchScore?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface BuyerDashboardData {
  businessName: string;
  greeting: string;
  summaryLine: string;
  activeRecommendations: number;
  openDemands: number;
  pendingOffers: number;
  upcomingPickups: number;
  committedValue: number;
  currency: string;
  demandCoverage: Array<{
    produce: string;
    coveragePercent: number;
    status: 'full' | 'partial' | 'none';
  }>;
  topRecommendations: BuyerRecommendation[];
  pendingOffersList: import('@/types/offer').Offer[];
  upcomingPickupsList: import('@/types/transaction').Transaction[];
  recentNotifications: import('@/types/notification').Notification[];
  activityByWeek: Array<{ week: string; offers: number; transactions: number }>;
}

export interface BuyerInsights {
  offersCreated: number;
  offerAcceptanceRate: number;
  transactionsCompleted: number;
  totalTransactionValue: number;
  averageTransactionSize: number;
  produceByCategory: Array<{ category: string; quantity: number; unit: string }>;
  topRegions: Array<{ region: string; count: number }>;
  demandCoverage: Array<{ produce: string; percent: number }>;
  avgRecommendationScore: number;
  recommendationsConverted: number;
  priceObservations: Array<{
    produce: string;
    avgOfferedPrice: number;
    acceptedRange: { min: number; max: number };
    listingRange: { min: number; max: number };
    unit: string;
  }>;
}
