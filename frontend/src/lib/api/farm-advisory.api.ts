import { apiPost } from './client';
import type { AdvisoryChatRequest, AdvisoryChatResponse } from '@/types/farm-advisory';

export async function sendAdvisoryMessage(
  payload: AdvisoryChatRequest,
): Promise<AdvisoryChatResponse> {
  const response = await apiPost<AdvisoryChatResponse>('/farmers/advisory/chat', payload);
  return response.data;
}
