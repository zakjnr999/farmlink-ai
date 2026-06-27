/**
 * Returns true when `origin` matches an allowed entry.
 * Supports exact origins, `*`, and subdomain wildcards such as `https://*.vercel.app`.
 */
export function isAllowedCorsOrigin(origin: string, allowedOrigins: string[]): boolean {
  for (const allowed of allowedOrigins) {
    if (allowed === '*') return true;
    if (allowed === origin) return true;

    const wildcardHostMatch = allowed.match(/^(https?):\/\/\*\.(.+)$/);
    if (wildcardHostMatch) {
      const [, protocol, hostSuffix] = wildcardHostMatch;
      const hostPattern = new RegExp(
        `^${protocol}://[a-z0-9-]+\\.${hostSuffix.replace(/\./g, '\\.')}$`,
        'i',
      );
      if (hostPattern.test(origin)) return true;
    }
  }

  return false;
}
