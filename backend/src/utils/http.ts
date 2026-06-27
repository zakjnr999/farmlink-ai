import type { Request } from 'express';

/**
 * Read a path parameter as a string. Express 5 types params as
 * `string | string[]`; route params are validated as UUID strings upstream, so
 * we collapse the (never-array) value to a string here for type-safety.
 */
export function getParam(req: Request, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}
