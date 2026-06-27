// Shared API types for the FarmLink AI backend.
// These mirror the backend response envelope and core DTOs. They are framework
// agnostic — copy this folder into your React / Vue / Svelte app as-is.

export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta: PaginationMeta | null;
}

export interface ApiError {
  success: false;
  message: string;
  error: { code: string; details?: unknown };
  requestId: string;
}

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  phoneVerified: boolean;
  profileImageUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
}

export interface RegisterInput {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  role: 'FARMER' | 'BUYER';
}

export interface LoginInput {
  identifier: string; // email or phone number
  password: string;
}

export interface ProduceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  unitOptions: string[];
  isActive: boolean;
}

export interface ProduceListing {
  id: string;
  title: string;
  description: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unit: string;
  minimumOrderQuantity: number | null;
  pricePerUnit: number | null;
  currency: string;
  harvestDate: string;
  availableFrom: string;
  availableUntil: string | null;
  region: string;
  district: string;
  town: string;
  latitude: number;
  longitude: number;
  status: string;
  distanceKm?: number;
}

export interface ExtractionResult {
  produceName: string | null;
  produceSlug: string | null;
  quantity: number | null;
  unit: string | null;
  location: { town: string | null; district: string | null; region: string | null };
  harvestDate: string | null;
  availableFrom: string | null;
  pricePerUnit: number | null;
  minimumOrderQuantity: number | null;
  confidence: number;
  missingFields: string[];
  clarificationQuestions: string[];
  provider: string;
  referenceDate: string;
  suggestedCategoryId: string | null;
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  offeredQuantity: number;
  unit: string;
  offeredPricePerUnit: number;
  totalAmount: number;
  message: string | null;
  proposedPickupDate: string;
  status: string;
  createdAt: string;
}

export interface MatchRecommendation {
  id: string;
  listingId: string;
  buyerId: string;
  score: number;
  produceScore: number;
  quantityScore: number;
  distanceScore: number;
  dateScore: number;
  priceScore: number;
  explanation: string;
  status: string;
  listing?: ProduceListing;
}
