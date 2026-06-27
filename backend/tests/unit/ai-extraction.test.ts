import { describe, expect, it } from 'vitest';
import { AIExtractionService } from '../../src/services/ai-extraction.service';
import { LocalExtractionProvider } from '../../src/services/ai/local-provider';
import { extractionResultSchema } from '../../src/services/ai/extraction.schema';
import type { AIExtractionProvider } from '../../src/services/ai/provider';

describe('LocalExtractionProvider', () => {
  const provider = new LocalExtractionProvider();

  it('extracts produce, quantity, unit, location and relative date', async () => {
    const result = await provider.extract({
      text: 'I have 60 crates of tomatoes ready next Monday at Agogo',
      referenceDate: '2026-06-26',
    });

    expect(result.produceName).toBe('Tomatoes');
    expect(result.quantity).toBe(60);
    expect(result.unit).toBe('CRATE');
    expect(result.location.town).toBe('Agogo');
    expect(result.location.region).toBe('Ashanti');
    // 2026-06-26 is a Friday; the upcoming/next Monday is 2026-06-29.
    expect(result.harvestDate).toBe('2026-06-29');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('reports missing fields and clarification questions', async () => {
    const result = await provider.extract({
      text: 'I have some tomatoes',
      referenceDate: '2026-06-26',
    });
    expect(result.missingFields).toContain('pricePerUnit');
    expect(result.missingFields).toContain('region');
    expect(result.clarificationQuestions.length).toBeGreaterThan(0);
  });

  it('produces output that satisfies the strict schema', async () => {
    const result = await provider.extract({
      text: '20kg of maize available tomorrow in Techiman',
      referenceDate: '2026-06-26',
    });
    expect(() => extractionResultSchema.parse(result)).not.toThrow();
    expect(result.unit).toBe('KG');
    expect(result.harvestDate).toBe('2026-06-27');
  });
});

describe('AIExtractionService fallback', () => {
  it('falls back to the local provider when the external provider throws', async () => {
    const failing: AIExtractionProvider = {
      name: 'failing',
      extract: async () => {
        throw new Error('network down');
      },
    };
    const service = new AIExtractionService(failing);
    const result = await service.extract({
      text: 'I have 30 bags of onions ready next Monday at Tamale',
      referenceDate: '2026-06-26',
    });
    expect(result.provider).toBe('local');
    expect(result.produceName).toBe('Onions');
    expect(result.unit).toBe('BAG');
  });

  it('rejects invalid external output and falls back to local', async () => {
    const invalid: AIExtractionProvider = {
      name: 'invalid',
      extract: async () => ({ produceName: 123, confidence: 'high' }),
    };
    const service = new AIExtractionService(invalid);
    const result = await service.extract({
      text: '10 crates of pepper at Kumasi tomorrow',
      referenceDate: '2026-06-26',
    });
    expect(result.provider).toBe('local');
    expect(result.produceName).toBe('Pepper');
  });
});
