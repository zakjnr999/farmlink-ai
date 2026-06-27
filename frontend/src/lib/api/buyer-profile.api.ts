import { apiGet, apiPatch, apiPost } from './client';
import type {
  BuyerDemand,
  BuyerDemandPayload,
  BuyerOnboardingData,
  BuyerProfile,
  BuyerProfileUpdate,
} from '@/types/buyer';

export async function getBuyerProfile(): Promise<BuyerProfile> {
  const response = await apiGet<BuyerProfile>('/buyers/profile');
  return response.data;
}

export async function updateBuyerProfile(update: BuyerProfileUpdate): Promise<BuyerProfile> {
  const response = await apiPatch<BuyerProfile>('/buyers/profile', update);
  return response.data;
}

export async function completeBuyerOnboarding(data: BuyerOnboardingData): Promise<BuyerProfile> {
  const response = await apiPost<BuyerProfile>('/buyers/onboarding', data);
  return response.data;
}

export async function getBuyerDemands(): Promise<BuyerDemand[]> {
  const response = await apiGet<BuyerDemand[]>('/buyers/demands');
  return response.data;
}

export async function getBuyerDemand(id: string): Promise<BuyerDemand> {
  const response = await apiGet<BuyerDemand>(`/buyers/demands/${id}`);
  return response.data;
}

export async function createBuyerDemand(payload: BuyerDemandPayload): Promise<BuyerDemand> {
  const response = await apiPost<BuyerDemand>('/buyers/demands', payload);
  return response.data;
}

export async function updateBuyerDemand(
  id: string,
  payload: Partial<BuyerDemandPayload>,
): Promise<BuyerDemand> {
  const response = await apiPatch<BuyerDemand>(`/buyers/demands/${id}`, payload);
  return response.data;
}

export async function deleteBuyerDemand(id: string): Promise<void> {
  await apiPost<void>(`/buyers/demands/${id}`, undefined);
}
