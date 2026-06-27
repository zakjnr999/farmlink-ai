import type { BuyerType } from '@/types/buyer';

export const BUYER_TYPE_OPTIONS: Array<{ value: BuyerType; label: string }> = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'school', label: 'School' },
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'market_trader', label: 'Market trader' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'processor', label: 'Food processor' },
  { value: 'individual', label: 'Individual bulk buyer' },
  { value: 'other', label: 'Other' },
];

export const DEMAND_FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every two weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'custom', label: 'Custom' },
] as const;
