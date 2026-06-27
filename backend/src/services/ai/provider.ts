import type { ExtractionResult } from './extraction.schema';

export interface ExtractionInput {
  text: string;
  referenceDate: string; // ISO yyyy-mm-dd
}

/**
 * Provider interface so any external LLM can be plugged in later. Implementations
 * must return raw structured output; the service validates it against the Zod
 * schema before trusting it.
 */
export interface AIExtractionProvider {
  readonly name: string;
  extract(input: ExtractionInput): Promise<unknown>;
}

export type { ExtractionResult };
