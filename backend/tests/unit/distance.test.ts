import { describe, expect, it } from 'vitest';
import { haversineDistanceKm } from '../../src/utils/distance';

describe('haversineDistanceKm', () => {
  it('returns 0 for identical points', () => {
    const p = { latitude: 6.8001, longitude: -1.0819 };
    expect(haversineDistanceKm(p, p)).toBe(0);
  });

  it('computes a realistic distance between Agogo and Kumasi (~70-90km)', () => {
    const agogo = { latitude: 6.8001, longitude: -1.0819 };
    const kumasi = { latitude: 6.6885, longitude: -1.6244 };
    const distance = haversineDistanceKm(agogo, kumasi);
    expect(distance).toBeGreaterThan(50);
    expect(distance).toBeLessThan(100);
  });

  it('is symmetric', () => {
    const a = { latitude: 5.6037, longitude: -0.187 };
    const b = { latitude: 9.4008, longitude: -0.8393 };
    expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a), 5);
  });
});
