import { logger } from '../../config/logger';
import type { AIExtractionProvider, ExtractionInput } from './provider';

/**
 * Placeholder external-LLM provider. It is intentionally lightweight: when an
 * API key is configured it would call the LLM with a structured prompt and
 * return the raw JSON. The service layer validates the output and falls back to
 * the local provider on any failure, so the app is always demonstrable offline.
 *
 * The actual network call is left unimplemented to avoid a hard dependency on a
 * paid API during the hackathon. Wire it up by replacing `callModel`.
 */
export class OpenAIExtractionProvider implements AIExtractionProvider {
  readonly name = 'openai';

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async extract(input: ExtractionInput): Promise<unknown> {
    if (!this.apiKey) {
      throw new Error('AI_API_KEY is not configured for the openai provider');
    }
    return this.callModel(input);
  }

  private async callModel(_input: ExtractionInput): Promise<unknown> {
    // Intentionally not implemented for the MVP scaffold.
    logger.warn(
      { model: this.model },
      'OpenAIExtractionProvider.callModel is a stub; falling back to local provider',
    );
    throw new Error('External AI provider not implemented in MVP scaffold');
  }
}
