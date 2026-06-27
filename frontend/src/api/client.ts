// Framework-agnostic FarmLink AI API client.
//
// Usage (any bundler that exposes an env var for the API base URL):
//
//   import { FarmLinkClient } from './api/client';
//   const api = new FarmLinkClient(import.meta.env.VITE_API_BASE_URL);
//   const { accessToken } = await api.login({ identifier: 'farmer@farmlink.local', password: '...' });
//   const recs = await api.getRecommendations();
//
// The client stores the bearer token in memory (and optionally localStorage)
// and attaches it to authenticated requests.

import type {
  ApiSuccess,
  AuthResult,
  ExtractionResult,
  LoginInput,
  MatchRecommendation,
  Offer,
  ProduceCategory,
  ProduceListing,
  RegisterInput,
  User,
} from './types';

export class FarmLinkApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    public requestId?: string,
  ) {
    super(message);
    this.name = 'FarmLinkApiError';
  }
}

const TOKEN_STORAGE_KEY = 'farmlink.accessToken';

export interface FarmLinkClientOptions {
  /** Persist the token in localStorage (browser only). Default: true. */
  persistToken?: boolean;
}

export class FarmLinkClient {
  private token: string | null = null;
  private readonly baseUrl: string;
  private readonly persistToken: boolean;

  constructor(baseUrl: string, options: FarmLinkClientOptions = {}) {
    // Normalise to e.g. "https://host/api/v1" (no trailing slash).
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.persistToken = options.persistToken ?? true;
    if (this.persistToken && typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_STORAGE_KEY);
    }
  }

  setToken(token: string | null): void {
    this.token = token;
    if (this.persistToken && typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
      else localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | boolean | undefined>,
  ): Promise<ApiSuccess<T>> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const payload = (await res.json().catch(() => null)) as
      | ApiSuccess<T>
      | { success: false; message: string; error?: { code: string; details?: unknown }; requestId?: string }
      | null;

    if (!res.ok || !payload || payload.success === false) {
      const errBody = payload as
        | { message?: string; error?: { code?: string; details?: unknown }; requestId?: string }
        | null;
      throw new FarmLinkApiError(
        res.status,
        errBody?.error?.code ?? 'UNKNOWN',
        errBody?.message ?? `Request failed with status ${res.status}`,
        errBody?.error?.details,
        errBody?.requestId,
      );
    }

    return payload;
  }

  // --- Auth ---------------------------------------------------------------

  async register(input: RegisterInput): Promise<AuthResult> {
    const res = await this.request<AuthResult>('POST', '/auth/register', input);
    this.setToken(res.data.accessToken);
    return res.data;
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const res = await this.request<AuthResult>('POST', '/auth/login', input);
    this.setToken(res.data.accessToken);
    return res.data;
  }

  logout(): void {
    this.setToken(null);
  }

  async me(): Promise<User> {
    const res = await this.request<{ user: User }>('GET', '/auth/me');
    return res.data.user;
  }

  // --- Categories ---------------------------------------------------------

  async getCategories(): Promise<ProduceCategory[]> {
    const res = await this.request<{ categories: ProduceCategory[] }>('GET', '/categories');
    return res.data.categories;
  }

  // --- Farmer: listings ---------------------------------------------------

  async extractProduce(text: string, referenceDate?: string): Promise<ExtractionResult> {
    const res = await this.request<ExtractionResult>('POST', '/listings/extract', {
      text,
      referenceDate,
    });
    return res.data;
  }

  async createListing(input: Record<string, unknown>): Promise<ProduceListing> {
    const res = await this.request<{ listing: ProduceListing }>('POST', '/listings', input);
    return res.data.listing;
  }

  async publishListing(listingId: string): Promise<ProduceListing> {
    const res = await this.request<{ listing: ProduceListing }>(
      'POST',
      `/listings/${listingId}/publish`,
    );
    return res.data.listing;
  }

  async getMyListings(page = 1, limit = 20): Promise<ApiSuccess<{ listings: ProduceListing[] }>> {
    return this.request<{ listings: ProduceListing[] }>('GET', '/listings/my', undefined, {
      page,
      limit,
    });
  }

  async getListingMatches(listingId: string): Promise<MatchRecommendation[]> {
    const res = await this.request<{ matches: MatchRecommendation[] }>(
      'GET',
      `/listings/${listingId}/matches`,
    );
    return res.data.matches;
  }

  // --- Marketplace (public) ----------------------------------------------

  async searchMarketplace(
    filters: Record<string, string | number | boolean | undefined> = {},
  ): Promise<ApiSuccess<{ listings: ProduceListing[] }>> {
    return this.request<{ listings: ProduceListing[] }>(
      'GET',
      '/marketplace/listings',
      undefined,
      filters,
    );
  }

  // --- Buyer --------------------------------------------------------------

  async getRecommendations(): Promise<MatchRecommendation[]> {
    const res = await this.request<{ recommendations: MatchRecommendation[] }>(
      'GET',
      '/buyers/recommendations',
    );
    return res.data.recommendations;
  }

  async createOffer(input: {
    listingId: string;
    offeredQuantity: number;
    unit: string;
    offeredPricePerUnit: number;
    proposedPickupDate: string;
    message?: string;
  }): Promise<Offer> {
    const res = await this.request<{ offer: Offer }>('POST', '/offers', input);
    return res.data.offer;
  }

  // --- Offers workflow ----------------------------------------------------

  async acceptOffer(offerId: string): Promise<{ offer: Offer; transaction: unknown }> {
    const res = await this.request<{ offer: Offer; transaction: unknown }>(
      'POST',
      `/farmers/offers/${offerId}/accept`,
    );
    return res.data;
  }

  // --- Generic escape hatch ----------------------------------------------

  /** Call any endpoint not covered by a helper above. */
  call<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | boolean | undefined>,
  ): Promise<ApiSuccess<T>> {
    return this.request<T>(method, path, body, query);
  }
}
