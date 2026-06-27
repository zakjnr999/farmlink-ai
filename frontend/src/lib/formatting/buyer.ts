import type { BuyerType } from '@/types/buyer';

const BUYER_TYPE_LABELS: Record<BuyerType, string> = {
  restaurant: 'Restaurant',
  hotel: 'Hotel',
  school: 'School',
  supermarket: 'Supermarket',
  market_trader: 'Market trader',
  wholesaler: 'Wholesaler',
  processor: 'Food processor',
  individual: 'Individual bulk buyer',
  other: 'Other',
};

export function formatBuyerType(type: BuyerType): string {
  return BUYER_TYPE_LABELS[type];
}

export function formatMatchScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent alignment';
  if (score >= 75) return 'Strong alignment';
  if (score >= 60) return 'Moderate alignment';
  return 'Review carefully';
}

export function formatDemandCoverageStatus(
  percent: number,
): 'full' | 'partial' | 'none' {
  if (percent >= 100) return 'full';
  if (percent > 0) return 'partial';
  return 'none';
}

export function formatBuyerTransactionStatus(status: string): string {
  const labels: Record<string, string> = {
    pending_payment: 'Confirmed',
    payment_confirmed: 'Awaiting pickup',
    in_transit: 'In transit',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
  };
  return labels[status] ?? status;
}
