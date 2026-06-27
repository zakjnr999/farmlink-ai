import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../constants/pagination';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function resolvePagination(input: { page?: number; limit?: number }): PaginationParams {
  const page = Math.max(1, Math.trunc(input.page ?? DEFAULT_PAGE));
  const rawLimit = Math.trunc(input.limit ?? DEFAULT_LIMIT);
  const limit = Math.min(MAX_LIMIT, Math.max(1, rawLimit));
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}
