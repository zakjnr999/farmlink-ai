'use client';

import { useQuery } from '@tanstack/react-query';
import { listingsApi, notificationsApi, offersApi, transactionsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { Listing } from '@/types/listing';
import type { Offer } from '@/types/offer';
import type { Transaction } from '@/types/transaction';
import type { Notification } from '@/types/notification';
import type { BuyerMatch } from '@/types/match';

export function useDashboardData() {
  const listingsQuery = useQuery({
    queryKey: queryKeys.listings.my(),
    queryFn: listingsApi.getListings,
  });

  const offersQuery = useQuery({
    queryKey: queryKeys.offers.list({ status: 'pending' }),
    queryFn: offersApi.getOffers,
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: transactionsApi.getTransactions,
  });

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list({ limit: 5 }),
    queryFn: notificationsApi.getNotifications,
  });

  const listings = listingsQuery.data ?? [];
  const offers = offersQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];

  const activeListings = listings.filter((l) => l.status === 'active');
  const pendingOffers = offers.filter((o) => o.status === 'pending');
  const upcomingPickups = transactions.filter(
    (t) =>
      t.status === 'payment_confirmed' ||
      t.status === 'in_transit' ||
      t.status === 'pending_payment',
  );

  return {
    isLoading:
      listingsQuery.isLoading ||
      offersQuery.isLoading ||
      transactionsQuery.isLoading,
    isError: listingsQuery.isError,
    listings,
    activeListings,
    pendingOffers,
    upcomingPickups,
    notifications: notifications.slice(0, 5),
    unreadNotifications: notifications.filter((n) => !n.read).length,
    refetch: () => {
      listingsQuery.refetch();
      offersQuery.refetch();
      transactionsQuery.refetch();
      notificationsQuery.refetch();
    },
  };
}

export type DashboardListing = Listing;
export type DashboardOffer = Offer;
export type DashboardTransaction = Transaction;
export type DashboardNotification = Notification;
export type DashboardMatch = BuyerMatch;
