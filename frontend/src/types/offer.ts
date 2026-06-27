export type OfferStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'countered'
  | 'expired'
  | 'withdrawn'
  | 'cancelled'
  | 'completed';

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  currency: string;
  message?: string;
  status: OfferStatus;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferActionPayload {
  message?: string;
  counterPricePerUnit?: number;
  counterQuantity?: number;
}

export interface CreateOfferPayload {
  listingId: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  proposedPickupDate?: string;
  message?: string;
  demandId?: string;
  recommendationId?: string;
}
