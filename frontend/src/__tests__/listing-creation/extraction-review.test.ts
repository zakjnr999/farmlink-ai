import { describe, expect, it } from 'vitest';
import { extractionReviewSchema } from '@/features/listing-creation/schemas/extraction-review.schema';

describe('Extraction review schema', () => {
  it('requires quantity greater than zero', () => {
    const result = extractionReviewSchema.safeParse({
      title: 'Tomatoes',
      produceType: 'Tomatoes',
      categoryId: 'cat-tomatoes',
      quantity: 0,
      unit: 'crate',
      harvestDate: '2026-06-29',
      availableFrom: '2026-06-29',
      region: 'Ashanti',
      district: 'Asante Akim North',
      village: 'Agogo',
      confidence: 'high',
      missingFields: [],
      clarificationAnswers: {},
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid reviewed listing', () => {
    const result = extractionReviewSchema.safeParse({
      title: 'Fresh tomatoes',
      produceType: 'Tomatoes',
      categoryId: 'cat-tomatoes',
      quantity: 60,
      unit: 'crate',
      pricePerUnit: 180,
      harvestDate: '2026-06-29',
      availableFrom: '2026-06-29',
      region: 'Ashanti',
      district: 'Asante Akim North',
      village: 'Agogo',
      confidence: 'high',
      missingFields: ['Price per crate'],
      clarificationAnswers: {},
      rawText: 'I have 60 crates of tomatoes ready next Monday at Agogo.',
    });
    expect(result.success).toBe(true);
  });
});
