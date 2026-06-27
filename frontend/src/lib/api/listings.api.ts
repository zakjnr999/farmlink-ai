import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from './client';
import type {
  Listing,
  ListingCreatePayload,
  ListingUpdatePayload,
} from '@/types/listing';

export async function getListings(): Promise<Listing[]> {
  const response = await apiGet<Listing[]>('/listings');
  return response.data;
}

export async function getListing(id: string): Promise<Listing> {
  const response = await apiGet<Listing>(`/listings/${id}`);
  return response.data;
}

export async function createListing(payload: ListingCreatePayload): Promise<Listing> {
  const response = await apiPost<Listing>('/listings', payload);
  return response.data;
}

export async function updateListing(
  id: string,
  payload: ListingUpdatePayload,
): Promise<Listing> {
  const response = await apiPut<Listing>(`/listings/${id}`, payload);
  return response.data;
}

export async function patchListing(
  id: string,
  payload: ListingUpdatePayload,
): Promise<Listing> {
  const response = await apiPatch<Listing>(`/listings/${id}`, payload);
  return response.data;
}

export async function deleteListing(id: string): Promise<void> {
  await apiDelete<void>(`/listings/${id}`);
}

export async function getListingOffers(listingId: string) {
  const response = await apiGet<import('@/types/offer').Offer[]>(
    `/listings/${listingId}/offers`,
  );
  return response.data;
}
