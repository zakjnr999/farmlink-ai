import { apiGet } from './client';
import type { MarketplaceFilters, MarketplaceListing } from '@/types/buyer';

function buildQuery(filters?: MarketplaceFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function getMarketplaceListings(
  filters?: MarketplaceFilters,
): Promise<MarketplaceListing[]> {
  const response = await apiGet<MarketplaceListing[]>(
    `/marketplace/listings${buildQuery(filters)}`,
  );
  return response.data;
}

export async function getMarketplaceListing(id: string): Promise<MarketplaceListing> {
  const response = await apiGet<MarketplaceListing>(`/marketplace/listings/${id}`);
  return response.data;
}
