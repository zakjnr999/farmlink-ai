import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { ACCRA_TIMEZONE } from './currency';

function toDate(value: string | Date): Date | null {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

export function formatDate(
  value: string | Date,
  pattern = 'dd MMM yyyy',
): string {
  const date = toDate(value);
  if (!date) return '';
  return formatInTimeZone(date, ACCRA_TIMEZONE, pattern);
}

export function formatDateTime(
  value: string | Date,
  pattern = 'dd MMM yyyy, h:mm a',
): string {
  const date = toDate(value);
  if (!date) return '';
  return formatInTimeZone(date, ACCRA_TIMEZONE, pattern);
}

export function formatRelativeDate(value: string | Date): string {
  const date = toDate(value);
  if (!date) return '';
  const zoned = toZonedTime(date, ACCRA_TIMEZONE);
  return formatDistanceToNow(zoned, { addSuffix: true });
}

export function formatTime(value: string | Date, pattern = 'h:mm a'): string {
  const date = toDate(value);
  if (!date) return '';
  return formatInTimeZone(date, ACCRA_TIMEZONE, pattern);
}

export function formatShortDate(value: string | Date): string {
  return formatDate(value, 'dd/MM/yy');
}

export { format, ACCRA_TIMEZONE };
