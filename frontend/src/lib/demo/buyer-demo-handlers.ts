import type { ApiMethod, ApiResponse } from '@/types/api';
import {
  getBuyerProfileForCurrentUser,
  getDemoCurrentUser,
  resetDemoUserRegistry,
  updateBuyerProfileForCurrentUser,
} from './demo-user-registry';
import type {
  BuyerDemand,
  BuyerDemandPayload,
  BuyerOnboardingData,
  BuyerProfileUpdate,
  MarketplaceFilters,
  MarketplaceListing,
} from '@/types/buyer';
import type { CreateOfferPayload, Offer } from '@/types/offer';
import {
  demoBuyerDemands,
  demoBuyerNotifications,
  demoBuyerOffers,
  demoBuyerRecommendations,
  demoBuyerTransactions,
  demoMarketplaceListings,
  DEMO_BUYER_ID,
} from './buyer-demo-data';

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { data, message };
}

function matchPath(path: string, pattern: string): RegExpMatchArray | null {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  return path.match(regex);
}

function parseId(path: string, prefix: string): string {
  const id = path.replace(prefix, '').split('/')[0];
  if (!id) throw { message: 'Resource ID required', code: 'NOT_FOUND', status: 404 };
  return id;
}

function notFound(message: string): never {
  throw { message, code: 'NOT_FOUND', status: 404 };
}

let mutableBuyerDemands = [...demoBuyerDemands];
let mutableBuyerOffers = [...demoBuyerOffers];
let mutableBuyerTransactions = [...demoBuyerTransactions];
let mutableBuyerNotifications = [...demoBuyerNotifications];
let mutableBuyerRecommendations = [...demoBuyerRecommendations];
let mutableMarketplaceListings = [...demoMarketplaceListings];

export { getDemoCurrentUser } from './demo-user-registry';

export function resetBuyerDemoState(): void {
  resetDemoUserRegistry();
  mutableBuyerDemands = [...demoBuyerDemands];
  mutableBuyerOffers = [...demoBuyerOffers];
  mutableBuyerTransactions = [...demoBuyerTransactions];
  mutableBuyerNotifications = [...demoBuyerNotifications];
  mutableBuyerRecommendations = [...demoBuyerRecommendations];
  mutableMarketplaceListings = [...demoMarketplaceListings];
}

function filterMarketplace(
  listings: MarketplaceListing[],
  filters: MarketplaceFilters,
): MarketplaceListing[] {
  let result = [...listings];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.produceType.toLowerCase().includes(q) ||
        l.farmerName.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        (l.town?.toLowerCase().includes(q) ?? false),
    );
  }
  if (filters.category) {
    result = result.filter(
      (l) => l.categoryId === filters.category || l.produceType.toLowerCase().includes(filters.category!.toLowerCase()),
    );
  }
  if (filters.region) {
    result = result.filter((l) => l.region === filters.region);
  }
  if (filters.minQuantity) {
    result = result.filter((l) => l.quantity >= filters.minQuantity!);
  }
  if (filters.maxPrice) {
    result = result.filter((l) => l.pricePerUnit <= filters.maxPrice!);
  }
  if (filters.verifiedOnly) {
    result = result.filter((l) => l.farmerVerified);
  }
  if (filters.maxDistance) {
    result = result.filter((l) => (l.distanceKm ?? Infinity) <= filters.maxDistance!);
  }

  switch (filters.sort) {
    case 'nearest':
      result.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      break;
    case 'lowest_price':
      result.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
      break;
    case 'highest_quantity':
      result.sort((a, b) => b.quantity - a.quantity);
      break;
    case 'earliest_availability':
      result.sort((a, b) => new Date(a.availableFrom).getTime() - new Date(b.availableFrom).getTime());
      break;
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    default:
      result.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }

  return result;
}

export async function handleBuyerDemoRequest<T>(
  method: ApiMethod,
  path: string,
  body?: unknown,
  searchParams?: URLSearchParams,
): Promise<ApiResponse<T> | null> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const demoCurrentUser = getDemoCurrentUser();

  if (normalizedPath === '/buyers/profile' && method === 'GET') {
    const profile = getBuyerProfileForCurrentUser();
    if (!profile) notFound('Buyer profile not found');
    return ok(profile as T);
  }

  if (normalizedPath === '/buyers/profile' && (method === 'POST' || method === 'PATCH')) {
    const update = body as BuyerProfileUpdate | BuyerOnboardingData;
    const profile = updateBuyerProfileForCurrentUser(update);
    return ok(profile as T);
  }

  if (normalizedPath === '/buyers/onboarding' && method === 'POST') {
    const data = body as BuyerOnboardingData;
    const profile = updateBuyerProfileForCurrentUser({
      ...data,
      onboardingComplete: true,
    });
    return ok(profile as T, 'Onboarding complete (demo mode)');
  }

  if (normalizedPath === '/buyers/demands' && method === 'GET') {
    return ok(mutableBuyerDemands as T);
  }

  if (normalizedPath === '/buyers/demands' && method === 'POST') {
    const payload = body as BuyerDemandPayload;
    const demand: BuyerDemand = {
      id: `demand-${Date.now()}`,
      buyerId: DEMO_BUYER_ID,
      currency: 'GHS',
      status: 'active',
      matchingListingsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    };
    mutableBuyerDemands = [demand, ...mutableBuyerDemands];
    return ok(demand as T);
  }

  const demandMatch = matchPath(normalizedPath, '/buyers/demands/:id');
  if (demandMatch && method === 'GET') {
    const demand = mutableBuyerDemands.find((d) => d.id === demandMatch[1]);
    if (!demand) notFound('Demand not found');
    return ok(demand as T);
  }

  if (demandMatch && method === 'PATCH') {
    const index = mutableBuyerDemands.findIndex((d) => d.id === demandMatch[1]);
    if (index === -1) notFound('Demand not found');
    mutableBuyerDemands[index] = {
      ...mutableBuyerDemands[index],
      ...(body as BuyerDemandPayload),
      updatedAt: new Date().toISOString(),
    };
    return ok(mutableBuyerDemands[index] as T);
  }

  if (demandMatch && method === 'DELETE') {
    mutableBuyerDemands = mutableBuyerDemands.filter((d) => d.id !== demandMatch[1]);
    return ok(undefined as T, 'Demand deleted (demo mode)');
  }

  if (normalizedPath === '/buyers/recommendations' && method === 'GET') {
    return ok(mutableBuyerRecommendations as T);
  }

  const recMatch = matchPath(normalizedPath, '/buyers/recommendations/:id');
  if (recMatch && method === 'GET') {
    const rec = mutableBuyerRecommendations.find((r) => r.id === recMatch[1]);
    if (!rec) notFound('Recommendation not found');
    return ok(rec as T);
  }

  if (normalizedPath === '/marketplace/listings' && method === 'GET') {
    const filters: MarketplaceFilters = {};
    searchParams?.forEach((value, key) => {
      if (key === 'minQuantity' || key === 'maxPrice' || key === 'maxDistance' || key === 'page' || key === 'limit') {
        (filters as Record<string, unknown>)[key] = Number(value);
      } else if (key === 'verifiedOnly') {
        filters.verifiedOnly = value === 'true';
      } else {
        (filters as Record<string, unknown>)[key] = value;
      }
    });
    const filtered = filterMarketplace(mutableMarketplaceListings, filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const start = (page - 1) * limit;
    return ok(filtered.slice(start, start + limit) as T);
  }

  const listingMatch = matchPath(normalizedPath, '/marketplace/listings/:id');
  if (listingMatch && method === 'GET') {
    const listing = mutableMarketplaceListings.find((l) => l.id === listingMatch[1]);
    if (!listing) notFound('Listing not found');
    return ok(listing as T);
  }

  if (normalizedPath === '/buyers/offers' && method === 'GET') {
    return ok(mutableBuyerOffers as T);
  }

  const buyerOfferMatch = matchPath(normalizedPath, '/buyers/offers/:id');
  if (buyerOfferMatch && method === 'GET') {
    const offer = mutableBuyerOffers.find((o) => o.id === buyerOfferMatch[1]);
    if (!offer) notFound('Offer not found');
    return ok(offer as T);
  }

  if (matchPath(normalizedPath, '/buyers/offers/:id/cancel') && method === 'POST') {
    const id = parseId(normalizedPath.replace('/cancel', ''), '/buyers/offers/');
    const index = mutableBuyerOffers.findIndex((o) => o.id === id);
    if (index === -1) notFound('Offer not found');
    if (mutableBuyerOffers[index].status !== 'pending') {
      throw { message: 'Only pending offers can be cancelled', code: 'INVALID_STATE', status: 400 };
    }
    mutableBuyerOffers[index] = {
      ...mutableBuyerOffers[index],
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
    return ok(mutableBuyerOffers[index] as T);
  }

  if (normalizedPath === '/offers' && method === 'POST') {
    const payload = body as CreateOfferPayload;
    const listing = mutableMarketplaceListings.find((l) => l.id === payload.listingId);
    if (!listing) notFound('Listing not found');
    const total = payload.quantity * payload.pricePerUnit;
    const offer: Offer = {
      id: `buyer-offer-${Date.now()}`,
      listingId: payload.listingId,
      buyerId: DEMO_BUYER_ID,
      buyerName: getBuyerProfileForCurrentUser()?.businessName ?? 'Buyer',
      quantity: payload.quantity,
      unit: payload.unit,
      pricePerUnit: payload.pricePerUnit,
      totalAmount: total,
      currency: listing.currency,
      message: payload.message,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mutableBuyerOffers = [offer, ...mutableBuyerOffers];
    if (payload.recommendationId) {
      const recIndex = mutableBuyerRecommendations.findIndex((r) => r.id === payload.recommendationId);
      if (recIndex >= 0) {
        mutableBuyerRecommendations[recIndex] = {
          ...mutableBuyerRecommendations[recIndex],
          status: 'offer_sent',
        };
      }
    }
    return ok(offer as T, 'Offer sent (demo mode)');
  }

  if (normalizedPath === '/buyers/transactions' && method === 'GET') {
    return ok(mutableBuyerTransactions as T);
  }

  const txnMatch = matchPath(normalizedPath, '/buyers/transactions/:id');
  if (txnMatch && method === 'GET') {
    const txn = mutableBuyerTransactions.find((t) => t.id === txnMatch[1]);
    if (!txn) notFound('Transaction not found');
    return ok(txn as T);
  }

  if (normalizedPath === '/notifications' && method === 'GET' && demoCurrentUser.role === 'buyer') {
    return ok(mutableBuyerNotifications as T);
  }

  if (normalizedPath === '/notifications/unread-count' && method === 'GET' && demoCurrentUser.role === 'buyer') {
    const count = mutableBuyerNotifications.filter((n) => !n.read).length;
    return ok({ count } as T);
  }

  if (normalizedPath === '/notifications/read-all' && method === 'POST' && demoCurrentUser.role === 'buyer') {
    mutableBuyerNotifications = mutableBuyerNotifications.map((n) => ({ ...n, read: true }));
    return ok(mutableBuyerNotifications as T);
  }

  const notifReadMatch = matchPath(normalizedPath, '/notifications/:id/read');
  if (notifReadMatch && method === 'PATCH' && demoCurrentUser.role === 'buyer') {
    const index = mutableBuyerNotifications.findIndex((n) => n.id === notifReadMatch[1]);
    if (index === -1) notFound('Notification not found');
    mutableBuyerNotifications[index] = { ...mutableBuyerNotifications[index], read: true };
    return ok(mutableBuyerNotifications[index] as T);
  }

  return null;
}

export {
  mutableBuyerOffers,
  mutableBuyerRecommendations,
  mutableBuyerDemands,
  mutableMarketplaceListings,
};
