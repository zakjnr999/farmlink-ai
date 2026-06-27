import { describe, expect, it } from 'vitest';
import {
  scoreDistance,
  scoreMatch,
  type ScoringBuyer,
  type ScoringListing,
} from '../../src/services/matching/scoring';

const baseListing: ScoringListing = {
  categoryId: 'cat-tomatoes',
  categoryName: 'Tomatoes',
  categorySlug: 'tomatoes',
  quantity: 60,
  pricePerUnit: 180,
  latitude: 6.8001,
  longitude: -1.0819, // Agogo
  availableFrom: new Date('2026-06-29T08:00:00Z'),
  availableUntil: new Date('2026-07-13T08:00:00Z'),
};

function buyer(overrides: Partial<ScoringBuyer>): ScoringBuyer {
  return {
    businessName: 'Test Buyer',
    latitude: 6.8001,
    longitude: -1.0819,
    maximumTravelDistanceKm: 200,
    minimumOrderQuantity: null,
    preferredProduce: [],
    demands: [],
    ...overrides,
  };
}

const matchingDemand = {
  categoryId: 'cat-tomatoes',
  minimumQuantity: 40,
  maximumQuantity: 100,
  preferredPriceMaximum: 200,
  requiredFrom: new Date('2026-06-25T00:00:00Z'),
  requiredUntil: new Date('2026-07-10T00:00:00Z'),
  unit: 'CRATE',
};

describe('scoreMatch', () => {
  it('ranks a buyer with an exact active demand higher than one with only a preference', () => {
    const exact = scoreMatch(baseListing, buyer({ demands: [matchingDemand] }));
    const preferenceOnly = scoreMatch(baseListing, buyer({ preferredProduce: ['tomatoes'] }));
    const none = scoreMatch(baseListing, buyer({}));

    expect(exact.produceScore).toBe(100);
    expect(preferenceOnly.produceScore).toBe(70);
    expect(none.produceScore).toBe(10);
    expect(exact.score).toBeGreaterThan(preferenceOnly.score);
    expect(preferenceOnly.score).toBeGreaterThan(none.score);
  });

  it('scores a nearby buyer higher than a far buyer', () => {
    const near = scoreMatch(baseListing, buyer({ demands: [matchingDemand] }));
    const far = scoreMatch(
      baseListing,
      buyer({ demands: [matchingDemand], latitude: 5.6037, longitude: -0.187 }), // Accra ~200km
    );
    expect(near.distanceScore).toBeGreaterThan(far.distanceScore);
    expect(near.score).toBeGreaterThan(far.score);
  });

  it('gives a distance score of 0 beyond the buyer travel limit', () => {
    const result = scoreMatch(
      baseListing,
      buyer({
        demands: [matchingDemand],
        latitude: 5.6037,
        longitude: -0.187,
        maximumTravelDistanceKm: 10,
      }),
    );
    expect(result.distanceScore).toBe(0);
  });

  it('returns a human-readable explanation', () => {
    const result = scoreMatch(
      baseListing,
      buyer({ businessName: 'Golden Spoon', demands: [matchingDemand] }),
    );
    expect(result.explanation).toContain('Golden Spoon');
    expect(result.explanation).toMatch(/km away/);
  });
});

describe('scoreDistance bands', () => {
  it('applies the configured distance bands', () => {
    expect(scoreDistance(10, 200)).toBe(100);
    expect(scoreDistance(35, 200)).toBe(85);
    expect(scoreDistance(80, 200)).toBe(65);
    expect(scoreDistance(150, 200)).toBe(40);
    expect(scoreDistance(250, 200)).toBe(0);
  });
});
