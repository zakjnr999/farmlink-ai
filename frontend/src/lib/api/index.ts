export {
  apiClient,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  isBrowserOffline,
  normalizeApiError,
  isApiError,
} from './client';

export * as authApi from './auth.api';
export * as farmerProfileApi from './farmer-profile.api';
export * as listingExtractionApi from './listing-extraction.api';
export * as listingsApi from './listings.api';
export * as matchesApi from './matches.api';
export * as offersApi from './offers.api';
export * as transactionsApi from './transactions.api';
export * as transportApi from './transport.api';
export * as notificationsApi from './notifications.api';
export * as categoriesApi from './categories.api';
export * as buyerProfileApi from './buyer-profile.api';
export * as demandsApi from './demands.api';
export * as recommendationsApi from './recommendations.api';
export * as marketplaceApi from './marketplace.api';
export * as buyerOffersApi from './buyer-offers.api';
export * as farmAdvisoryApi from './farm-advisory.api';
export * as buyerTransactionsApi from './buyer-transactions.api';

export { login, register, getCurrentUser, logout } from './auth.api';
export { getFarmerProfile, updateFarmerProfile, completeOnboarding } from './farmer-profile.api';
export { extractListingFields } from './listing-extraction.api';
export {
  getListings,
  getListing,
  createListing,
  updateListing,
  patchListing,
  deleteListing,
  getListingOffers,
} from './listings.api';
export { getMatches, getListingMatches } from './matches.api';
export { getOffers, getOffer, acceptOffer, rejectOffer, counterOffer } from './offers.api';
export { getTransactions, getTransaction } from './transactions.api';
export {
  getTransportSuggestions,
  getTransactionTransportSuggestions,
} from './transport.api';
export {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from './notifications.api';
export { getCategories, getCategory, getActiveCategories } from './categories.api';
export { sendAdvisoryMessage } from './farm-advisory.api';
