import { apiGet } from './client';
import type { BuyerMatch } from '@/types/match';

export async function getMatches(): Promise<BuyerMatch[]> {
  const response = await apiGet<BuyerMatch[]>('/matches');
  return response.data;
}

export async function getListingMatches(listingId: string): Promise<BuyerMatch[]> {
  const response = await apiGet<BuyerMatch[]>(`/listings/${listingId}/matches`);
  return response.data;
}
