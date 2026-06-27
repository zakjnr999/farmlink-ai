export interface ErrorBody {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
  requestId: string;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
