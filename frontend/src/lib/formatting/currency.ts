const ACCRA_TIMEZONE = 'Africa/Accra';
const DEFAULT_CURRENCY = 'GHS';

export function formatGhs(
  amount: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options ?? {};
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

export function formatCurrency(amount: number, currency?: string): string {
  if (currency && currency !== DEFAULT_CURRENCY) {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return formatGhs(amount);
}

export function parseGhsInput(value: string): number | null {
  const cleaned = value.replace(/[^\d.-]/g, '');
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export { ACCRA_TIMEZONE, DEFAULT_CURRENCY };
