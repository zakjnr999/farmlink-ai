export interface ProduceUnit {
  id: string;
  label: string;
  abbreviation: string;
  category: 'weight' | 'volume' | 'count' | 'container';
}

export const PRODUCE_UNITS: readonly ProduceUnit[] = [
  { id: 'kg', label: 'Kilogram', abbreviation: 'kg', category: 'weight' },
  { id: 'tonne', label: 'Metric Tonne', abbreviation: 't', category: 'weight' },
  { id: 'crate', label: 'Crate', abbreviation: 'crate', category: 'container' },
  { id: 'bag', label: 'Bag', abbreviation: 'bag', category: 'container' },
  { id: 'sack', label: 'Sack (50kg)', abbreviation: 'sack', category: 'container' },
  { id: 'basket', label: 'Basket', abbreviation: 'basket', category: 'container' },
  { id: 'piece', label: 'Piece', abbreviation: 'pc', category: 'count' },
  { id: 'dozen', label: 'Dozen', abbreviation: 'dz', category: 'count' },
  { id: 'litre', label: 'Litre', abbreviation: 'L', category: 'volume' },
  { id: 'bushel', label: 'Bushel', abbreviation: 'bu', category: 'volume' },
] as const;

export const PRODUCE_UNIT_IDS = PRODUCE_UNITS.map((u) => u.id);

export function findUnitById(id: string): ProduceUnit | undefined {
  return PRODUCE_UNITS.find((u) => u.id === id);
}

export function findUnitLabel(id: string): string {
  return findUnitById(id)?.label ?? id;
}
