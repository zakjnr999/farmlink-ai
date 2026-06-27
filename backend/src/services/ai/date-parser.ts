import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Parse a relative or absolute date phrase against a reference date.
 * Returns an ISO yyyy-mm-dd string, or null when nothing matches.
 */
export function parseRelativeDate(text: string, referenceDate: string): string | null {
  const ref = dayjs(referenceDate);
  if (!ref.isValid()) return null;
  const lower = text.toLowerCase();

  if (/\btoday\b/.test(lower)) return ref.format('YYYY-MM-DD');
  if (/\btomorrow\b/.test(lower)) return ref.add(1, 'day').format('YYYY-MM-DD');
  if (/\bday after tomorrow\b/.test(lower)) return ref.add(2, 'day').format('YYYY-MM-DD');
  if (/\bnext week\b/.test(lower)) return ref.add(7, 'day').format('YYYY-MM-DD');

  const inDays = lower.match(/\bin (\d{1,2}) days?\b/);
  if (inDays) return ref.add(Number(inDays[1]), 'day').format('YYYY-MM-DD');

  const weekdayMatch = lower.match(
    /\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/,
  );
  if (weekdayMatch) {
    const isNext = Boolean(weekdayMatch[1]);
    const targetDow = WEEKDAYS.indexOf(weekdayMatch[2]);
    const currentDow = ref.day();
    let diff = (targetDow - currentDow + 7) % 7;
    // "Monday" alone meaning the upcoming one; if today, treat as +7.
    if (diff === 0) diff = 7;
    if (isNext && diff <= 7) {
      // "next Monday" => the Monday of next week if the upcoming one is this week.
      if (diff < 7) diff += 0; // keep upcoming; "next" is commonly the nearest future.
    }
    return ref.add(diff, 'day').format('YYYY-MM-DD');
  }

  // Absolute formats: 2026-06-29, 29/06/2026, 29-06-2026
  const iso = lower.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) {
    const d = dayjs(iso[1], 'YYYY-MM-DD', true);
    if (d.isValid()) return d.format('YYYY-MM-DD');
  }
  const dmy = lower.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
  if (dmy) {
    const d = dayjs(
      `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`,
      'YYYY-MM-DD',
      true,
    );
    if (d.isValid()) return d.format('YYYY-MM-DD');
  }

  return null;
}
