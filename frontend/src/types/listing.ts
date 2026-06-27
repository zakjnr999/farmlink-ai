export type ListingStatus =
  | 'draft'
  | 'active'
  | 'pending_review'
  | 'sold'
  | 'expired'
  | 'archived';

export type AIConfidence = 'high' | 'medium' | 'low' | 'unknown';

export interface Listing {
  id: string;
  farmerId: string;
  title: string;
  categoryId: string;
  categoryName?: string;
  produceType: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  description?: string;
  images: string[];
  harvestDate?: string;
  availableFrom: string;
  availableUntil?: string;
  region: string;
  district: string;
  status: ListingStatus;
  aiConfidence?: AIConfidence;
  createdAt: string;
  updatedAt: string;
}

export interface ListingDraft {
  id?: string;
  localId: string;
  title?: string;
  categoryId?: string;
  produceType?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
  description?: string;
  images?: string[];
  harvestDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  region?: string;
  district?: string;
  synced: boolean;
  lastModified: string;
}

export interface ExtractionResult {
  title?: string;
  categoryId?: string;
  produceType?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
  description?: string;
  harvestDate?: string;
  confidence: AIConfidence;
  rawText?: string;
}

export interface ListingCreatePayload {
  title: string;
  categoryId: string;
  produceType: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  description?: string;
  images?: string[];
  harvestDate?: string;
  availableFrom: string;
  availableUntil?: string;
  region: string;
  district: string;
}

export interface ListingUpdatePayload extends Partial<ListingCreatePayload> {
  status?: ListingStatus;
}
