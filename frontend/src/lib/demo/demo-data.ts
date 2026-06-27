import type { User } from '@/types/auth';
import type { FarmerProfile } from '@/types/farmer';
import type { ProduceCategory } from '@/types/category';
import type { Listing } from '@/types/listing';
import type { Offer } from '@/types/offer';
import type { Transaction } from '@/types/transaction';
import type { BuyerMatch } from '@/types/match';
import type { Notification } from '@/types/notification';
import type { TransportSuggestion } from '@/types/transport';

const now = new Date().toISOString();
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

export const DEMO_USER_ID = 'user-kwame-mensah';
export const DEMO_FARMER_ID = 'farmer-kwame-mensah';
export const DEMO_LISTING_ID = 'listing-tomatoes-kumasi';

export const demoUser: User = {
  id: DEMO_USER_ID,
  email: 'kwame.mensah@example.com',
  phone: '+233244123456',
  fullName: 'Kwame Mensah',
  role: 'farmer',
  roles: ['farmer'],
  createdAt: weekAgo,
  updatedAt: now,
};

export const demoFarmerProfile: FarmerProfile = {
  id: DEMO_FARMER_ID,
  userId: DEMO_USER_ID,
  farmName: 'Mensah Valley Farms',
  region: 'Ashanti',
  district: 'Ejisu Municipal',
  village: 'Bonwire',
  gpsCoordinates: { lat: 6.6885, lng: -1.6244 },
  farmSizeAcres: 12,
  primaryCrops: ['Tomatoes', 'Maize', 'Plantain'],
  bio: 'Third-generation farmer specializing in organic tomatoes and staple crops for local markets.',
  onboardingComplete: true,
  createdAt: weekAgo,
  updatedAt: now,
};

export const demoCategories: ProduceCategory[] = [
  {
    id: 'cat-vegetables',
    name: 'Vegetables',
    slug: 'vegetables',
    icon: 'leaf',
    commonUnits: ['kg', 'crate', 'basket'],
    active: true,
  },
  {
    id: 'cat-fruits',
    name: 'Fruits',
    slug: 'fruits',
    icon: 'apple',
    commonUnits: ['kg', 'crate', 'piece'],
    active: true,
  },
  {
    id: 'cat-grains',
    name: 'Grains & Cereals',
    slug: 'grains',
    icon: 'wheat',
    commonUnits: ['bag', 'sack', 'tonne'],
    active: true,
  },
  {
    id: 'cat-tubers',
    name: 'Tubers & Roots',
    slug: 'tubers',
    icon: 'carrot',
    commonUnits: ['bag', 'sack', 'kg'],
    active: true,
  },
  {
    id: 'cat-tomatoes',
    name: 'Tomatoes',
    slug: 'tomatoes',
    icon: 'tomato',
    parentId: 'cat-vegetables',
    commonUnits: ['crate', 'kg', 'basket'],
    active: true,
  },
];

export const demoListings: Listing[] = [
  {
    id: DEMO_LISTING_ID,
    farmerId: DEMO_FARMER_ID,
    title: 'Fresh Roma Tomatoes — Ejisu Farm',
    categoryId: 'cat-tomatoes',
    categoryName: 'Tomatoes',
    produceType: 'Roma Tomatoes',
    quantity: 150,
    unit: 'crate',
    pricePerUnit: 85,
    currency: 'GHS',
    description:
      'Vine-ripened Roma tomatoes harvested this week. Ideal for market traders and processing. Stored in ventilated crates.',
    images: [],
    harvestDate: twoDaysAgo,
    availableFrom: twoDaysAgo,
    availableUntil: nextWeek,
    region: 'Ashanti',
    district: 'Ejisu Municipal',
    status: 'active',
    aiConfidence: 'high',
    createdAt: twoDaysAgo,
    updatedAt: now,
  },
  {
    id: 'listing-plantain-kumasi',
    farmerId: DEMO_FARMER_ID,
    title: 'Apem Plantain Bunches',
    categoryId: 'cat-fruits',
    categoryName: 'Fruits',
    produceType: 'Apem Plantain',
    quantity: 200,
    unit: 'piece',
    pricePerUnit: 8,
    currency: 'GHS',
    description: 'Medium-sized Apem plantain bunches, ready for ripening.',
    images: [],
    availableFrom: weekAgo,
    availableUntil: nextWeek,
    region: 'Ashanti',
    district: 'Ejisu Municipal',
    status: 'active',
    aiConfidence: 'medium',
    createdAt: weekAgo,
    updatedAt: now,
  },
];

export const demoBuyers = [
  { id: 'buyer-accra-market', name: 'Accra Central Market Traders', region: 'Greater Accra' },
  { id: 'buyer-kumasi-wholesale', name: 'Kumasi Wholesale Depot', region: 'Ashanti' },
  { id: 'buyer-tema-processor', name: 'Tema Fresh Foods Ltd', region: 'Greater Accra' },
  { id: 'buyer-takoradi-export', name: 'Western Coast Exporters', region: 'Western' },
];

export const demoOffers: Offer[] = [
  {
    id: 'offer-001',
    listingId: DEMO_LISTING_ID,
    buyerId: 'buyer-accra-market',
    buyerName: 'Accra Central Market Traders',
    quantity: 100,
    unit: 'crate',
    pricePerUnit: 82,
    totalAmount: 8200,
    currency: 'GHS',
    message: 'Can pick up tomorrow morning from Ejisu. Cash on delivery.',
    status: 'pending',
    expiresAt: tomorrow,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'offer-002',
    listingId: DEMO_LISTING_ID,
    buyerId: 'buyer-tema-processor',
    buyerName: 'Tema Fresh Foods Ltd',
    quantity: 150,
    unit: 'crate',
    pricePerUnit: 80,
    totalAmount: 12000,
    currency: 'GHS',
    message: 'Weekly supply contract possible if quality is consistent.',
    status: 'pending',
    expiresAt: nextWeek,
    createdAt: twoDaysAgo,
    updatedAt: now,
  },
];

export const demoMatches: BuyerMatch[] = [
  {
    id: 'match-001',
    buyerId: 'buyer-kumasi-wholesale',
    buyerName: 'Kumasi Wholesale Depot',
    listingId: DEMO_LISTING_ID,
    score: 92,
    label: 'excellent',
    distanceKm: 18.5,
    region: 'Ashanti',
    preferredQuantity: 120,
    preferredUnit: 'crate',
    notes: 'Regular buyer of Roma tomatoes; prefers weekly deliveries.',
    createdAt: now,
  },
  {
    id: 'match-002',
    buyerId: 'buyer-accra-market',
    buyerName: 'Accra Central Market Traders',
    listingId: DEMO_LISTING_ID,
    score: 78,
    label: 'good',
    distanceKm: 245,
    region: 'Greater Accra',
    preferredQuantity: 80,
    preferredUnit: 'crate',
    notes: 'High demand for tomatoes in dry season.',
    createdAt: now,
  },
  {
    id: 'match-003',
    buyerId: 'buyer-takoradi-export',
    buyerName: 'Western Coast Exporters',
    listingId: DEMO_LISTING_ID,
    score: 55,
    label: 'fair',
    distanceKm: 310,
    region: 'Western',
    preferredQuantity: 200,
    preferredUnit: 'crate',
    createdAt: twoDaysAgo,
  },
];

export const demoTransactions: Transaction[] = [
  {
    id: 'txn-001',
    offerId: 'offer-prev-001',
    listingId: 'listing-plantain-kumasi',
    farmerId: DEMO_FARMER_ID,
    buyerId: 'buyer-kumasi-wholesale',
    buyerName: 'Kumasi Wholesale Depot',
    listingTitle: 'Apem Plantain Bunches',
    quantity: 50,
    unit: 'piece',
    pricePerUnit: 7.5,
    totalAmount: 375,
    currency: 'GHS',
    status: 'completed',
    paymentReference: 'MOMO-REF-88421',
    deliveryDate: weekAgo,
    createdAt: weekAgo,
    updatedAt: now,
  },
];

export const demoNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: DEMO_USER_ID,
    type: 'offer_received',
    title: 'New offer on your tomatoes',
    body: 'Accra Central Market Traders offered GHS 82/crate for 100 crates.',
    read: false,
    actionUrl: '/farmer/offers/offer-001',
    metadata: { offerId: 'offer-001', listingId: DEMO_LISTING_ID },
    createdAt: now,
  },
  {
    id: 'notif-002',
    userId: DEMO_USER_ID,
    type: 'match_found',
    title: 'Excellent buyer match found',
    body: 'Kumasi Wholesale Depot is a 92% match for your Roma tomatoes listing.',
    read: false,
    actionUrl: '/farmer/matches',
    metadata: { matchId: 'match-001' },
    createdAt: twoDaysAgo,
  },
  {
    id: 'notif-003',
    userId: DEMO_USER_ID,
    type: 'transaction_update',
    title: 'Payment confirmed',
    body: 'Your plantain sale to Kumasi Wholesale Depot has been paid.',
    read: true,
    actionUrl: '/farmer/transactions/txn-001',
    metadata: { transactionId: 'txn-001' },
    createdAt: weekAgo,
  },
];

export const demoTransportSuggestions: TransportSuggestion[] = [
  {
    id: 'transport-001',
    transactionId: 'txn-001',
    transporterName: 'Kofi Haulage Services',
    transporterPhone: '+233501234567',
    vehicleType: 'Refrigerated Truck (10T)',
    estimatedCost: 450,
    currency: 'GHS',
    estimatedDurationHours: 3.5,
    distanceKm: 18.5,
    rating: 4.7,
    notes: 'Available for early morning pickup from Ejisu.',
  },
  {
    id: 'transport-002',
    transporterName: 'Ashanti Agro Logistics',
    transporterPhone: '+233559876543',
    vehicleType: 'Pickup Truck (3T)',
    estimatedCost: 280,
    currency: 'GHS',
    estimatedDurationHours: 2,
    distanceKm: 18.5,
    rating: 4.3,
  },
];

export const demoAccessToken = 'demo-access-token-kwame-mensah';
