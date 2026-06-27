import { env } from '../config/env';
import { logger } from '../config/logger';
import { extractionResultSchema, type ExtractionResult } from './ai/extraction.schema';
import { LocalExtractionProvider } from './ai/local-provider';
import { OpenAIExtractionProvider } from './ai/openai-provider';
import type { AIExtractionProvider, ExtractionInput } from './ai/provider';

function buildPrimaryProvider(): AIExtractionProvider {
  if (env.AI_PROVIDER === 'openai' && env.AI_API_KEY) {
    return new OpenAIExtractionProvider(env.AI_API_KEY, env.AI_MODEL);
  }
  return new LocalExtractionProvider();
}

/**
 * AI produce extraction service.
 *
 * - Uses the configured provider (external LLM when keys exist).
 * - ALWAYS validates raw provider output against a strict Zod schema.
 * - Falls back to the deterministic local provider when no key exists or the
 *   external call fails or returns invalid output.
 */
export class AIExtractionService {
  private readonly primary: AIExtractionProvider;
  private readonly fallback: LocalExtractionProvider;

  constructor(primary: AIExtractionProvider = buildPrimaryProvider()) {
    this.primary = primary;
    this.fallback = new LocalExtractionProvider();
  }

  async extract(input: ExtractionInput): Promise<ExtractionResult & { provider: string }> {
    try {
      const raw = await this.primary.extract(input);
      const parsed = extractionResultSchema.safeParse(raw);
      if (parsed.success) {
        return { ...parsed.data, provider: this.primary.name };
      }
      logger.warn(
        { provider: this.primary.name, issues: parsed.error.issues },
        'Primary AI provider returned invalid output; falling back to local',
      );
    } catch (error) {
      logger.warn(
        { provider: this.primary.name, err: (error as Error).message },
        'Primary AI provider failed; falling back to local',
      );
    }

    const fallbackResult = await this.fallback.extract(input);
    // The local provider is internally typed; validate defensively anyway.
    const validated = extractionResultSchema.parse(fallbackResult);
    return { ...validated, provider: this.fallback.name };
  }
}

export const aiExtractionService = new AIExtractionService();
