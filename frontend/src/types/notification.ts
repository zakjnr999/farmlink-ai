export type NotificationType =
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'transaction_update'
  | 'match_found'
  | 'listing_expiring'
  | 'system'
  | 'recommendation'
  | 'offer'
  | 'transaction'
  | 'pickup'
  | 'account';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
