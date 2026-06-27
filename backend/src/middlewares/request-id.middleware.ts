import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/** Assigns a stable request id (from header or generated) for tracing/logging. */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers['x-request-id'];
  const id = typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
}
