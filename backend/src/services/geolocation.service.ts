import { haversineDistanceKm, type GeoPoint } from '../utils/distance';

/**
 * Approximate coordinates for common Ghanaian towns/cities. Used as a best-effort
 * lookup when free-text extraction yields a place name but no coordinates.
 */
export const GHANA_PLACES: Record<string, { region: string; district: string; point: GeoPoint }> = {
  agogo: {
    region: 'Ashanti',
    district: 'Asante Akim North',
    point: { latitude: 6.8001, longitude: -1.0819 },
  },
  kumasi: {
    region: 'Ashanti',
    district: 'Kumasi Metropolitan',
    point: { latitude: 6.6885, longitude: -1.6244 },
  },
  accra: {
    region: 'Greater Accra',
    district: 'Accra Metropolitan',
    point: { latitude: 5.6037, longitude: -0.187 },
  },
  'cape coast': {
    region: 'Central',
    district: 'Cape Coast Metropolitan',
    point: { latitude: 5.1315, longitude: -1.2795 },
  },
  koforidua: {
    region: 'Eastern',
    district: 'New Juaben',
    point: { latitude: 6.0941, longitude: -0.2591 },
  },
  techiman: {
    region: 'Bono East',
    district: 'Techiman Municipal',
    point: { latitude: 7.5907, longitude: -1.9389 },
  },
  tamale: {
    region: 'Northern',
    district: 'Tamale Metropolitan',
    point: { latitude: 9.4008, longitude: -0.8393 },
  },
  ho: {
    region: 'Volta',
    district: 'Ho Municipal',
    point: { latitude: 6.6008, longitude: 0.4713 },
  },
  kasoa: {
    region: 'Central',
    district: 'Awutu Senya East',
    point: { latitude: 5.5346, longitude: -0.4267 },
  },
};

export const geolocationService = {
  lookupTown(town: string | null | undefined) {
    if (!town) return null;
    return GHANA_PLACES[town.trim().toLowerCase()] ?? null;
  },

  distanceKm(a: GeoPoint, b: GeoPoint): number {
    return haversineDistanceKm(a, b);
  },
};
