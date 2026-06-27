import { apiGet, apiPost } from './client';
import type { Offer, OfferActionPayload } from '@/types/offer';

export async function getOffers(): Promise<Offer[]> {
  const response = await apiGet<Offer[]>('/offers');
  return response.data;
}

export async function getOffer(id: string): Promise<Offer> {
  const response = await apiGet<Offer>(`/offers/${id}`);
  return response.data;
}

export async function acceptOffer(id: string): Promise<Offer> {
  const response = await apiPost<Offer>(`/offers/${id}/accept`);
  return response.data;
}

export async function rejectOffer(id: string, payload?: OfferActionPayload): Promise<Offer> {
  const response = await apiPost<Offer>(`/offers/${id}/reject`, payload);
  return response.data;
}

export async function counterOffer(id: string, payload: OfferActionPayload): Promise<Offer> {
  const response = await apiPost<Offer>(`/offers/${id}/counter`, payload);
  return response.data;
}
