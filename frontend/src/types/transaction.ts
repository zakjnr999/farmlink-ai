export type TransactionStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface Transaction {
  id: string;
  offerId: string;
  listingId: string;
  farmerId: string;
  farmerName?: string;
  buyerId: string;
  buyerName?: string;
  listingTitle?: string;
  produceType?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  currency: string;
  status: TransactionStatus;
  paymentReference?: string;
  deliveryDate?: string;
  pickupLocation?: string;
  region?: string;
  transportId?: string;
  createdAt: string;
  updatedAt: string;
}
