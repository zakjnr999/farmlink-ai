import { ProduceUnit } from '@prisma/client';

/**
 * Canonical produce unit list together with common natural-language aliases.
 * Used by the AI extraction service to normalise free-text input.
 */
export const UNIT_ALIASES: Record<ProduceUnit, string[]> = {
  KG: ['kg', 'kilo', 'kilos', 'kilogram', 'kilograms', 'kgs'],
  TONNE: ['tonne', 'tonnes', 'ton', 'tons', 'metric ton'],
  CRATE: ['crate', 'crates'],
  BAG: ['bag', 'bags'],
  BOX: ['box', 'boxes'],
  BUNCH: ['bunch', 'bunches'],
  PIECE: ['piece', 'pieces', 'pcs', 'pc'],
  BASKET: ['basket', 'baskets'],
  SACK: ['sack', 'sacks', 'mini bag', 'mini-bag'],
};

/** Map a free-text unit token to a canonical ProduceUnit (or null). */
export function normaliseUnit(input: string): ProduceUnit | null {
  const token = input.trim().toLowerCase();
  for (const [unit, aliases] of Object.entries(UNIT_ALIASES) as [ProduceUnit, string[]][]) {
    if (unit.toLowerCase() === token || aliases.includes(token)) {
      return unit;
    }
  }
  return null;
}

/**
 * Common Ghanaian produce names and their canonical display name plus aliases.
 * Drives the deterministic extraction provider.
 */
export const PRODUCE_KEYWORDS: { canonical: string; slug: string; aliases: string[] }[] = [
  { canonical: 'Tomatoes', slug: 'tomatoes', aliases: ['tomato', 'tomatoes', 'ntoos'] },
  { canonical: 'Onions', slug: 'onions', aliases: ['onion', 'onions', 'gyeene'] },
  { canonical: 'Maize', slug: 'maize', aliases: ['maize', 'corn', 'aburo'] },
  { canonical: 'Cassava', slug: 'cassava', aliases: ['cassava', 'bankye'] },
  { canonical: 'Yam', slug: 'yam', aliases: ['yam', 'yams', 'bayere'] },
  { canonical: 'Plantain', slug: 'plantain', aliases: ['plantain', 'plantains', 'borode'] },
  { canonical: 'Rice', slug: 'rice', aliases: ['rice'] },
  { canonical: 'Pepper', slug: 'pepper', aliases: ['pepper', 'peppers', 'chilli', 'chili'] },
  { canonical: 'Okra', slug: 'okra', aliases: ['okra', 'okro'] },
  { canonical: 'Cabbage', slug: 'cabbage', aliases: ['cabbage', 'cabbages'] },
  { canonical: 'Carrots', slug: 'carrots', aliases: ['carrot', 'carrots'] },
  { canonical: 'Pineapple', slug: 'pineapple', aliases: ['pineapple', 'pineapples'] },
  { canonical: 'Mango', slug: 'mango', aliases: ['mango', 'mangoes', 'mangos'] },
  { canonical: 'Orange', slug: 'orange', aliases: ['orange', 'oranges'] },
  { canonical: 'Watermelon', slug: 'watermelon', aliases: ['watermelon', 'watermelons'] },
];

export function normaliseProduceName(input: string): { canonical: string; slug: string } | null {
  const text = input.trim().toLowerCase();
  for (const entry of PRODUCE_KEYWORDS) {
    if (entry.aliases.some((alias) => text.includes(alias))) {
      return { canonical: entry.canonical, slug: entry.slug };
    }
  }
  return null;
}
