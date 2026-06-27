import { Prisma } from '@prisma/client';

/** Convert a Prisma.Decimal (or nullable) to a JS number for JSON responses. */
export function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

/** Round a monetary value to 2 decimal places (server-side authority). */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Compute a total amount = quantity * pricePerUnit, rounded to 2dp. */
export function computeTotalAmount(quantity: number, pricePerUnit: number): number {
  return roundMoney(quantity * pricePerUnit);
}
