/** Weighted scoring configuration for the matching engine. Weights sum to 1.0. */
export const MATCH_WEIGHTS = {
  produce: 0.35,
  quantity: 0.2,
  distance: 0.2,
  date: 0.15,
  price: 0.1,
} as const;

/** Distance thresholds (km) -> score. Evaluated in ascending order. */
export const DISTANCE_SCORE_BANDS: { maxKm: number; score: number }[] = [
  { maxKm: 20, score: 100 },
  { maxKm: 50, score: 85 },
  { maxKm: 100, score: 65 },
  { maxKm: 200, score: 40 },
];

/** Minimum total score required to persist a recommendation. */
export const MIN_RECOMMENDATION_SCORE = 25;

/** Neutral score used when a dimension cannot be evaluated (e.g. no price data). */
export const NEUTRAL_SCORE = 60;

/** Transport pooling configuration. */
export const TRANSPORT_POOL_RADIUS_KM = 20;
export const TRANSPORT_POOL_DATE_WINDOW_DAYS = 3;
