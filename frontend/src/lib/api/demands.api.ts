import { apiGet } from './client';
import type { BuyerDemand, BuyerDemandPayload } from '@/types/buyer';
import { apiPatch, apiPost } from './client';

export async function getDemands(): Promise<BuyerDemand[]> {
  const response = await apiGet<BuyerDemand[]>('/buyers/demands');
  return response.data;
}

export async function getDemand(id: string): Promise<BuyerDemand> {
  const response = await apiGet<BuyerDemand>(`/buyers/demands/${id}`);
  return response.data;
}

export async function createDemand(payload: BuyerDemandPayload): Promise<BuyerDemand> {
  const response = await apiPost<BuyerDemand>('/buyers/demands', payload);
  return response.data;
}

export async function updateDemand(
  id: string,
  payload: Partial<BuyerDemandPayload>,
): Promise<BuyerDemand> {
  const response = await apiPatch<BuyerDemand>(`/buyers/demands/${id}`, payload);
  return response.data;
}

export async function deleteDemand(id: string): Promise<void> {
  await apiPatch<void>(`/buyers/demands/${id}`, { status: 'inactive' });
}
