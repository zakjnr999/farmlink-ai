import { apiGet } from './client';
import type { TransportSuggestion } from '@/types/transport';

export interface TransportQueryParams {
  listingId?: string;
  transactionId?: string;
  distanceKm?: number;
  region?: string;
}

export async function getTransportSuggestions(
  params?: TransportQueryParams,
): Promise<TransportSuggestion[]> {
  const response = await apiGet<TransportSuggestion[]>('/transport/suggestions', {
    params,
  });
  return response.data;
}

export async function getTransactionTransportSuggestions(
  transactionId: string,
): Promise<TransportSuggestion[]> {
  const response = await apiGet<TransportSuggestion[]>(
    `/transactions/${transactionId}/transport`,
  );
  return response.data;
}
