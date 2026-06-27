export interface GhanaRegion {
  name: string;
  code: string;
  capital: string;
}

export const GHANA_REGIONS: readonly GhanaRegion[] = [
  { name: 'Ahafo', code: 'AH', capital: 'Goaso' },
  { name: 'Ashanti', code: 'AS', capital: 'Kumasi' },
  { name: 'Bono', code: 'BO', capital: 'Sunyani' },
  { name: 'Bono East', code: 'BE', capital: 'Techiman' },
  { name: 'Central', code: 'CE', capital: 'Cape Coast' },
  { name: 'Eastern', code: 'EA', capital: 'Koforidua' },
  { name: 'Greater Accra', code: 'GA', capital: 'Accra' },
  { name: 'North East', code: 'NE', capital: 'Nalerigu' },
  { name: 'Northern', code: 'NO', capital: 'Tamale' },
  { name: 'Oti', code: 'OT', capital: 'Dambai' },
  { name: 'Savannah', code: 'SV', capital: 'Damongo' },
  { name: 'Upper East', code: 'UE', capital: 'Bolgatanga' },
  { name: 'Upper West', code: 'UW', capital: 'Wa' },
  { name: 'Volta', code: 'VO', capital: 'Ho' },
  { name: 'Western', code: 'WE', capital: 'Sekondi-Takoradi' },
  { name: 'Western North', code: 'WN', capital: 'Sefwi Wiawso' },
] as const;

export const GHANA_REGION_NAMES = GHANA_REGIONS.map((r) => r.name);

export function findRegionByName(name: string): GhanaRegion | undefined {
  return GHANA_REGIONS.find(
    (r) => r.name.toLowerCase() === name.toLowerCase(),
  );
}
