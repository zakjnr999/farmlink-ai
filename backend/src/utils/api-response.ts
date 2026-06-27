import type { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SuccessBody<T> {
  success: true;
  message: string;
  data: T;
  meta: PaginationMeta | null;
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function sendSuccess<T>(
  res: Response,
  options: { statusCode?: number; message: string; data: T; meta?: PaginationMeta | null },
): Response {
  const body: SuccessBody<T> = {
    success: true,
    message: options.message,
    data: options.data,
    meta: options.meta ?? null,
  };
  return res.status(options.statusCode ?? 200).json(body);
}
