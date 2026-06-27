import type { ApiMethod, ApiResponse } from '@/types/api';
import type { AuthSession, LoginCredentials, PortalRole, RegisterPayload } from '@/types/auth';
import type { AdvisoryChatRequest } from '@/types/farm-advisory';
import type { FarmerProfileUpdate, OnboardingData } from '@/types/farmer';
import type {
  ExtractionResult,
  Listing,
  ListingCreatePayload,
  ListingUpdatePayload,
} from '@/types/listing';
import type { OfferActionPayload } from '@/types/offer';
import {
  addPortalRoleToCurrentUser,
  getDemoCurrentUser,
  getFarmerProfileForCurrentUser,
  setDemoCurrentUserFromLogin,
  setDemoCurrentUserFromRegister,
  switchDemoPortal,
  updateFarmerProfileForCurrentUser,
} from './demo-user-registry';
import {
  handleBuyerDemoRequest,
  resetBuyerDemoState,
} from './buyer-demo-handlers';
import { generateFarmAdvisoryResponse } from './farm-advisory-demo';
import {
  demoAccessToken,
  demoCategories,
  demoListings,
  demoMatches,
  demoNotifications,
  demoOffers,
  demoTransactions,
  demoTransportSuggestions,
  DEMO_FARMER_ID,
  DEMO_LISTING_ID,
  DEMO_USER_ID,
} from './demo-data';

const DEMO_DELAY_MS = 400;

function delay(ms = DEMO_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { data, message };
}

function matchPath(path: string, pattern: string): RegExpMatchArray | null {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  return path.match(regex);
}

function notFound(message: string): never {
  throw { message, code: 'NOT_FOUND', status: 404 };
}

function parseId(path: string, prefix: string): string {
  const id = path.replace(prefix, '').split('/')[0];
  if (!id) notFound('Resource ID required');
  return id;
}

let mutableListings = [...demoListings];
let mutableOffers = [...demoOffers];
let mutableNotifications = [...demoNotifications];

export async function handleDemoRequest<T>(
  method: ApiMethod,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  await delay();

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Auth
  if (normalizedPath === '/auth/login' && method === 'POST') {
    const credentials = body as LoginCredentials;
    const currentUser = setDemoCurrentUserFromLogin(credentials);
    const session: AuthSession = {
      user: currentUser,
      accessToken: demoAccessToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    if (credentials.email && credentials.password) {
      return ok(session as T, 'Login successful (demo mode)');
    }
    throw { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS', status: 401 };
  }

  if (normalizedPath === '/auth/register' && method === 'POST') {
    const payload = body as RegisterPayload;
    const user = setDemoCurrentUserFromRegister(payload);
    const session: AuthSession = {
      user,
      accessToken: demoAccessToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    return ok(session as T, 'Registration successful (demo mode)');
  }

  if (normalizedPath === '/auth/add-role' && method === 'POST') {
    const { role } = body as { role: PortalRole };
    const user = addPortalRoleToCurrentUser(role);
    return ok(user as T, `${role} access added (demo mode)`);
  }

  if (normalizedPath === '/auth/switch-portal' && method === 'POST') {
    const { portalRole } = body as { portalRole: PortalRole };
    const user = switchDemoPortal(portalRole);
    return ok(user as T, 'Portal switched (demo mode)');
  }

  if (normalizedPath === '/auth/me' && method === 'GET') {
    return ok(getDemoCurrentUser() as T);
  }

  if (normalizedPath === '/auth/logout' && method === 'POST') {
    return ok(undefined as T, 'Logged out (demo mode)');
  }

  // Farmer profile
  if (normalizedPath === '/farmers/profile' && method === 'GET') {
    const profile = getFarmerProfileForCurrentUser();
    if (!profile) notFound('Farmer profile not found');
    return ok(profile as T);
  }

  if (normalizedPath === '/farmers/profile' && method === 'PUT') {
    const update = body as FarmerProfileUpdate;
    const profile = updateFarmerProfileForCurrentUser(update);
    return ok(profile as T);
  }

  if (normalizedPath === '/farmers/onboarding' && method === 'POST') {
    const data = body as OnboardingData;
    const profile = updateFarmerProfileForCurrentUser({
      ...data,
      onboardingComplete: true,
    });
    return ok(profile as T, 'Onboarding complete (demo mode)');
  }

  if (normalizedPath === '/farmers/advisory/chat' && method === 'POST') {
    const payload = body as AdvisoryChatRequest;
    const response = generateFarmAdvisoryResponse(payload.messages ?? []);
    return ok(response as T);
  }

  // Categories
  if (normalizedPath === '/categories' && method === 'GET') {
    return ok(demoCategories as T);
  }

  const categoryMatch = matchPath(normalizedPath, '/categories/:id');
  if (categoryMatch && method === 'GET') {
    const category = demoCategories.find((c) => c.id === categoryMatch[1]);
    if (!category) notFound('Category not found');
    return ok(category as T);
  }

  // Listings
  if (normalizedPath === '/listings' && method === 'GET') {
    return ok(mutableListings as T);
  }

  if (normalizedPath === '/listings' && method === 'POST') {
    const payload = body as ListingCreatePayload;
    const listing: Listing = {
      id: `listing-${Date.now()}`,
      farmerId: DEMO_FARMER_ID,
      currency: 'GHS',
      images: payload.images ?? [],
      status: 'active',
      aiConfidence: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    };
    mutableListings = [listing, ...mutableListings];
    return ok(listing as T, 'Listing created (demo mode)');
  }

  if (normalizedPath.startsWith('/listings/') && method === 'GET') {
    const id = parseId(normalizedPath, '/listings/');
    const listing = mutableListings.find((l) => l.id === id);
    if (!listing) notFound('Listing not found');
    return ok(listing as T);
  }

  if (normalizedPath.startsWith('/listings/') && (method === 'PUT' || method === 'PATCH')) {
    const id = parseId(normalizedPath, '/listings/');
    const index = mutableListings.findIndex((l) => l.id === id);
    if (index === -1) notFound('Listing not found');
    const update = body as ListingUpdatePayload;
    mutableListings[index] = {
      ...mutableListings[index],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    return ok(mutableListings[index] as T);
  }

  if (normalizedPath.startsWith('/listings/') && method === 'DELETE') {
    const id = parseId(normalizedPath, '/listings/');
    mutableListings = mutableListings.filter((l) => l.id !== id);
    return ok(undefined as T, 'Listing deleted (demo mode)');
  }

  // Listing extraction
  if (normalizedPath === '/listings/extract' && method === 'POST') {
    const payload = body as { text?: string; imageUrl?: string; referenceDate?: string };
    const text = (payload.text ?? '').toLowerCase();
    const isTomatoExample =
      text.includes('tomato') && (text.includes('agogo') || text.includes('crate'));

    const result: ExtractionResult = isTomatoExample
      ? {
          title: 'Fresh tomatoes',
          categoryId: 'cat-tomatoes',
          produceType: 'Tomatoes',
          quantity: 60,
          unit: 'crate',
          description: payload.text,
          harvestDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          confidence: 'high',
          rawText: payload.text,
        }
      : {
          title: 'Fresh Roma Tomatoes — Ejisu Farm',
          categoryId: 'cat-tomatoes',
          produceType: 'Roma Tomatoes',
          quantity: 150,
          unit: 'crate',
          pricePerUnit: 85,
          description: payload.text ?? 'Vine-ripened Roma tomatoes from Ejisu Municipal.',
          harvestDate: new Date().toISOString(),
          confidence: 'high',
          rawText: payload.text,
        };
    return ok(result as T);
  }

  // Offers
  if (normalizedPath === '/offers' && method === 'GET') {
    return ok(mutableOffers as T);
  }

  const offerMatch = matchPath(normalizedPath, '/offers/:id');
  if (offerMatch && method === 'GET') {
    const offer = mutableOffers.find((o) => o.id === offerMatch[1]);
    if (!offer) notFound('Offer not found');
    return ok(offer as T);
  }

  if (matchPath(normalizedPath, '/offers/:id/accept') && method === 'POST') {
    const id = parseId(normalizedPath.replace('/accept', ''), '/offers/');
    const index = mutableOffers.findIndex((o) => o.id === id);
    if (index === -1) notFound('Offer not found');
    mutableOffers[index] = {
      ...mutableOffers[index],
      status: 'accepted',
      updatedAt: new Date().toISOString(),
    };
    return ok(mutableOffers[index] as T);
  }

  if (matchPath(normalizedPath, '/offers/:id/reject') && method === 'POST') {
    const id = parseId(normalizedPath.replace('/reject', ''), '/offers/');
    const index = mutableOffers.findIndex((o) => o.id === id);
    if (index === -1) notFound('Offer not found');
    mutableOffers[index] = {
      ...mutableOffers[index],
      status: 'rejected',
      updatedAt: new Date().toISOString(),
    };
    return ok(mutableOffers[index] as T);
  }

  if (matchPath(normalizedPath, '/offers/:id/counter') && method === 'POST') {
    const id = parseId(normalizedPath.replace('/counter', ''), '/offers/');
    const index = mutableOffers.findIndex((o) => o.id === id);
    if (index === -1) notFound('Offer not found');
    const action = body as OfferActionPayload;
    const offer = mutableOffers[index];
    const price = action.counterPricePerUnit ?? offer.pricePerUnit;
    const qty = action.counterQuantity ?? offer.quantity;
    mutableOffers[index] = {
      ...offer,
      status: 'countered',
      pricePerUnit: price,
      quantity: qty,
      totalAmount: price * qty,
      updatedAt: new Date().toISOString(),
    };
    return ok(mutableOffers[index] as T);
  }

  if (normalizedPath === `/listings/${DEMO_LISTING_ID}/offers` && method === 'GET') {
    const listingOffers = mutableOffers.filter((o) => o.listingId === DEMO_LISTING_ID);
    return ok(listingOffers as T);
  }

  // Matches
  if (normalizedPath.startsWith('/listings/') && normalizedPath.endsWith('/matches') && method === 'GET') {
    const listingId = normalizedPath.replace('/listings/', '').replace('/matches', '');
    const matches = demoMatches.filter((m) => m.listingId === listingId);
    return ok(matches as T);
  }

  if (normalizedPath === '/matches' && method === 'GET') {
    return ok(demoMatches as T);
  }

  // Transactions
  if (normalizedPath === '/transactions' && method === 'GET') {
    return ok(demoTransactions as T);
  }

  if (normalizedPath.startsWith('/transactions/') && method === 'GET') {
    const id = parseId(normalizedPath, '/transactions/');
    const txn = demoTransactions.find((t) => t.id === id);
    if (!txn) notFound('Transaction not found');
    return ok(txn as T);
  }

  // Transport
  if (normalizedPath.startsWith('/transport/suggestions') && method === 'GET') {
    return ok(demoTransportSuggestions as T);
  }

  if (normalizedPath.startsWith('/transactions/') && normalizedPath.endsWith('/transport') && method === 'GET') {
    return ok(demoTransportSuggestions as T);
  }

  // Notifications
  if (normalizedPath === '/notifications' && method === 'GET') {
    return ok(mutableNotifications as T);
  }

  if (normalizedPath === '/notifications/read-all' && method === 'POST') {
    mutableNotifications = mutableNotifications.map((n) => ({ ...n, read: true }));
    return ok(mutableNotifications as T);
  }

  const notifMatch = matchPath(normalizedPath, '/notifications/:id/read');
  if (notifMatch && method === 'POST') {
    const index = mutableNotifications.findIndex((n) => n.id === notifMatch[1]);
    if (index === -1) notFound('Notification not found');
    mutableNotifications[index] = { ...mutableNotifications[index], read: true };
    return ok(mutableNotifications[index] as T);
  }

  const buyerResult = await handleBuyerDemoRequest<T>(method, normalizedPath, body);
  if (buyerResult) return buyerResult;

  throw {
    message: `Demo handler not found: ${method} ${normalizedPath}`,
    code: 'DEMO_ROUTE_NOT_FOUND',
    status: 404,
  };
}

export function resetDemoState(): void {
  mutableListings = [...demoListings];
  mutableOffers = [...demoOffers];
  mutableNotifications = [...demoNotifications];
  resetBuyerDemoState();
}

export { DEMO_USER_ID, DEMO_FARMER_ID, DEMO_LISTING_ID };
