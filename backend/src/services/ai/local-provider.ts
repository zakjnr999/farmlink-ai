import { ProduceUnit } from '@prisma/client';
import { normaliseProduceName, normaliseUnit, UNIT_ALIASES } from '../../constants/produce';
import { GHANA_PLACES } from '../geolocation.service';
import { parseRelativeDate } from './date-parser';
import type { AIExtractionProvider, ExtractionInput } from './provider';
import type { ExtractionResult } from './extraction.schema';

const ALL_UNIT_TOKENS = Object.values(UNIT_ALIASES).flat();

function extractQuantityAndUnit(text: string): {
  quantity: number | null;
  unit: ProduceUnit | null;
} {
  const lower = text.toLowerCase();
  // e.g. "60 crates", "20kg", "5 tonnes"
  const unitPattern = ALL_UNIT_TOKENS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join(
    '|',
  );
  const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${unitPattern})\\b`, 'i');
  const match = lower.match(regex);
  if (match) {
    return {
      quantity: Number(match[1]),
      unit: normaliseUnit(match[2]),
    };
  }
  // Bare number fallback (quantity only).
  const numMatch = lower.match(/\b(\d+(?:\.\d+)?)\b/);
  return { quantity: numMatch ? Number(numMatch[1]) : null, unit: null };
}

function extractLocation(text: string): {
  town: string | null;
  district: string | null;
  region: string | null;
} {
  const lower = text.toLowerCase();
  for (const [name, info] of Object.entries(GHANA_PLACES)) {
    if (lower.includes(name)) {
      return {
        town: name.replace(/\b\w/g, (c) => c.toUpperCase()),
        district: info.district,
        region: info.region,
      };
    }
  }
  // "at <Place>" / "in <Place>" capture for unknown places.
  const atMatch = text.match(/\b(?:at|in|from)\s+([A-Z][a-zA-Z]+)/);
  if (atMatch) {
    return { town: atMatch[1], district: null, region: null };
  }
  return { town: null, district: null, region: null };
}

function extractPrice(text: string): number | null {
  const lower = text.toLowerCase();
  const match = lower.match(/(?:ghs|gh₵|₵|cedis?)\s*(\d+(?:\.\d+)?)/);
  if (match) return Number(match[1]);
  const perMatch = lower.match(
    /(\d+(?:\.\d+)?)\s*(?:cedis|ghs)?\s*(?:per|each|\/)\s*(?:crate|kg|bag|unit|piece|bunch|basket|box|sack|tonne)/,
  );
  if (perMatch) return Number(perMatch[1]);
  return null;
}

function buildClarifications(missing: string[]): string[] {
  const map: Record<string, string> = {
    pricePerUnit: 'What price are you asking per unit?',
    district: 'Which district is the farm located in?',
    region: 'Which region is the farm located in?',
    harvestDate: 'When will the produce be ready (harvest date)?',
    quantity: 'How much produce do you have?',
    unit: 'What unit are you measuring in (crates, bags, kg)?',
    produceName: 'What type of produce are you selling?',
    minimumOrderQuantity: 'What is the minimum order quantity you will accept?',
  };
  const questions: string[] = [];
  if (missing.includes('district') || missing.includes('region')) {
    questions.push('Which district and region is the farm located in?');
  }
  for (const field of missing) {
    if (field === 'district' || field === 'region') continue;
    if (map[field]) questions.push(map[field]);
  }
  return questions;
}

/**
 * Deterministic, offline extraction provider. Handles the common phrasing used
 * by Ghanaian farmers without any external API. Always available as a fallback.
 */
export class LocalExtractionProvider implements AIExtractionProvider {
  readonly name = 'local';

  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    const { text, referenceDate } = input;

    const produce = normaliseProduceName(text);
    const { quantity, unit } = extractQuantityAndUnit(text);
    const location = extractLocation(text);
    const date = parseRelativeDate(text, referenceDate);
    const pricePerUnit = extractPrice(text);

    const missingFields: string[] = [];
    if (!produce) missingFields.push('produceName');
    if (quantity === null) missingFields.push('quantity');
    if (!unit) missingFields.push('unit');
    if (!date) missingFields.push('harvestDate');
    if (pricePerUnit === null) missingFields.push('pricePerUnit');
    if (!location.district) missingFields.push('district');
    if (!location.region) missingFields.push('region');

    // Confidence reflects how many core fields were detected.
    const coreSignals = [produce, quantity, unit, date].filter(
      (v) => v !== null && v !== undefined,
    ).length;
    const confidence = Math.min(0.95, 0.4 + coreSignals * 0.14);

    return {
      produceName: produce?.canonical ?? null,
      produceSlug: produce?.slug ?? null,
      quantity,
      unit,
      location,
      harvestDate: date,
      availableFrom: date,
      pricePerUnit,
      minimumOrderQuantity: null,
      confidence: Math.round(confidence * 100) / 100,
      missingFields,
      clarificationQuestions: buildClarifications(missingFields),
    };
  }
}
