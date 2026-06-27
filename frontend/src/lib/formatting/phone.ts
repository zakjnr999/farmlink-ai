export function formatGhanaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233') && digits.length === 12) {
    return `+233 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

export function normalizeGhanaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `+233${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+233${digits}`;
  }
  return phone.trim();
}

export function isValidGhanaPhone(phone: string): boolean {
  const normalized = normalizeGhanaPhone(phone);
  return /^\+233[235][0-9]{8}$/.test(normalized);
}

export function maskPhone(phone: string): string {
  const normalized = normalizeGhanaPhone(phone);
  if (normalized.length < 8) return phone;
  return `${normalized.slice(0, 6)}****${normalized.slice(-2)}`;
}
