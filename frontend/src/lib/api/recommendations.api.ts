import { apiGet } from './client';
import type { BuyerRecommendation } from '@/types/buyer';

export async function getRecommendations(): Promise<BuyerRecommendation[]> {
  const response = await apiGet<BuyerRecommendation[]>('/buyers/recommendations');
  return response.data;
}

export async function getRecommendation(id: string): Promise<BuyerRecommendation> {
  const response = await apiGet<BuyerRecommendation>(`/buyers/recommendations/${id}`);
  return response.data;
}
