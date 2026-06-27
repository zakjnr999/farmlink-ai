import type { ProduceCategory, ProduceListing } from '@prisma/client';
import { decimalToNumber } from '../../utils/decimal';

type ListingLike = ProduceListing & { category?: Pick<ProduceCategory, 'name' | 'slug'> | null };

export function serializeListing(listing: ListingLike) {
  const quantity = Number(listing.quantity);
  const reserved = Number(listing.reservedQuantity);
  return {
    ...listing,
    quantity,
    reservedQuantity: reserved,
    availableQuantity: Math.max(0, quantity - reserved),
    minimumOrderQuantity: decimalToNumber(listing.minimumOrderQuantity),
    pricePerUnit: decimalToNumber(listing.pricePerUnit),
  };
}
