import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import type { ApiError, ApiMethod, ApiResponse } from '@/types/api';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/auth/token-storage';
import { handleDemoRequest } from '@/lib/demo/demo-api';

export function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

export function normalizeApiError(error: unknown): ApiError {
  if (isBrowserOffline()) {
    return {
      message: 'You appear to be offline. Please check your connection.',
      code: 'OFFLINE',
      isOffline: true,
    };
  }

  if (isApiError(error)) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      code?: string;
      details?: Record<string, unknown> | unknown[];
    }>;

    if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
      return {
        message: config.isDemoMode
          ? 'Could not complete the request in demo mode. Try refreshing the page.'
          : `Cannot reach the FarmLink API at ${config.apiUrl}. Start the backend server, or set NEXT_PUBLIC_ENABLE_DEMO_MODE=true in .env.local and restart npm run dev.`,
        code: 'NETWORK_ERROR',
      };
    }

    return {
      message:
        axiosError.response?.data?.message ??
        axiosError.message ??
        'An unexpected error occurred',
      code: axiosError.response?.data?.code ?? axiosError.code,
      status: axiosError.response?.status,
      details: axiosError.response?.data?.details,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred' };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
}

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

apiClient.interceptors.request.use((requestConfig) => {
  const token = getAccessToken();
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(normalizeApiError(error)),
);

export async function apiRequest<T>(
  method: ApiMethod,
  path: string,
  data?: unknown,
  requestConfig?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  if (config.isDemoMode) {
    try {
      return await handleDemoRequest<T>(method, path, data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  if (isBrowserOffline()) {
    throw normalizeApiError(new Error('offline'));
  }

  try {
    const response = await apiClient.request<ApiResponse<T>>({
      method,
      url: path,
      data,
      ...requestConfig,
    });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function apiGet<T>(path: string, requestConfig?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return apiRequest<T>('GET', path, undefined, requestConfig);
}

export async function apiPost<T>(
  path: string,
  data?: unknown,
  requestConfig?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return apiRequest<T>('POST', path, data, requestConfig);
}

export async function apiPut<T>(
  path: string,
  data?: unknown,
  requestConfig?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return apiRequest<T>('PUT', path, data, requestConfig);
}

export async function apiPatch<T>(
  path: string,
  data?: unknown,
  requestConfig?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return apiRequest<T>('PATCH', path, data, requestConfig);
}

export async function apiDelete<T>(
  path: string,
  requestConfig?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return apiRequest<T>('DELETE', path, undefined, requestConfig);
}
