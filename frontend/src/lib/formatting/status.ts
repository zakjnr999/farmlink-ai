import type { AIConfidence, ListingStatus } from '@/types/listing';
import type { OfferStatus } from '@/types/offer';
import type { TransactionStatus } from '@/types/transaction';
import type { MatchLabel } from '@/types/match';

const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  pending_review: 'Pending Review',
  sold: 'Sold',
  expired: 'Expired',
  archived: 'Archived',
};

const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  countered: 'Countered',
  expired: 'Expired',
  withdrawn: 'Withdrawn',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pending_payment: 'Pending Payment',
  payment_confirmed: 'Payment Confirmed',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  completed: 'Completed',
  disputed: 'Disputed',
  cancelled: 'Cancelled',
};

const CONFIDENCE_LABELS: Record<AIConfidence, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence',
  unknown: 'Unknown',
};

const MATCH_LABEL_LABELS: Record<MatchLabel, string> = {
  excellent: 'Excellent Match',
  good: 'Good Match',
  fair: 'Fair Match',
  low: 'Low Match',
};

export function formatListingStatus(status: ListingStatus): string {
  return LISTING_STATUS_LABELS[status];
}

export function formatOfferStatus(status: OfferStatus): string {
  return OFFER_STATUS_LABELS[status];
}

export function formatTransactionStatus(status: TransactionStatus): string {
  return TRANSACTION_STATUS_LABELS[status];
}

export function formatConfidence(confidence: AIConfidence): string {
  return CONFIDENCE_LABELS[confidence];
}

export function formatMatchLabel(label: MatchLabel): string {
  return MATCH_LABEL_LABELS[label];
}

export {
  LISTING_STATUS_LABELS,
  OFFER_STATUS_LABELS,
  TRANSACTION_STATUS_LABELS,
  CONFIDENCE_LABELS,
  MATCH_LABEL_LABELS,
};
