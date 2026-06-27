import { apiGet, apiPost } from './client';
import type { CreateOfferPayload, Offer } from '@/types/offer';

export async function getBuyerOffers(): Promise<Offer[]> {
  const response = await apiGet<Offer[]>('/buyers/offers');
  return response.data;
}

export async function getBuyerOffer(id: string): Promise<Offer> {
  const response = await apiGet<Offer>(`/buyers/offers/${id}`);
  return response.data;
}

export async function createOffer(payload: CreateOfferPayload): Promise<Offer> {
  const response = await apiPost<Offer>('/offers', payload);
  return response.data;
}

export async function cancelBuyerOffer(id: string): Promise<Offer> {
  const response = await apiPost<Offer>(`/buyers/offers/${id}/cancel`);
  return response.data;
}
