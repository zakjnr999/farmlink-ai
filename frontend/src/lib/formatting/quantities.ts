import { findUnitLabel } from '@/constants/units';

export function formatQuantity(quantity: number, unit: string): string {
  const formattedQty = new Intl.NumberFormat('en-GH', {
    maximumFractionDigits: quantity % 1 === 0 ? 0 : 2,
  }).format(quantity);
  const unitLabel = findUnitLabel(unit);
  return `${formattedQty} ${unitLabel}`;
}

export function formatQuantityCompact(quantity: number, unit: string): string {
  const formattedQty = new Intl.NumberFormat('en-GH', {
    notation: quantity >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(quantity);
  return `${formattedQty} ${unit}`;
}

export function parseQuantityInput(value: string): number | null {
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
