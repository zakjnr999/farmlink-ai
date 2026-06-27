import type { Offer, ProduceTransaction } from '@prisma/client';
import { decimalToNumber } from '../../utils/decimal';

export function serializeOffer(offer: Offer) {
  return {
    ...offer,
    offeredQuantity: decimalToNumber(offer.offeredQuantity),
    offeredPricePerUnit: decimalToNumber(offer.offeredPricePerUnit),
    totalAmount: decimalToNumber(offer.totalAmount),
  };
}

export function serializeTransaction(tx: ProduceTransaction) {
  return {
    ...tx,
    agreedQuantity: decimalToNumber(tx.agreedQuantity),
    agreedPricePerUnit: decimalToNumber(tx.agreedPricePerUnit),
    totalAmount: decimalToNumber(tx.totalAmount),
  };
}
