import { apiPost } from './client';
import type { ExtractionResult } from '@/types/listing';

export interface ExtractListingPayload {
  text?: string;
  imageUrl?: string;
  imageBase64?: string;
}

export async function extractListingFields(
  payload: ExtractListingPayload,
): Promise<ExtractionResult> {
  const response = await apiPost<ExtractionResult>('/listings/extract', payload);
  return response.data;
}
