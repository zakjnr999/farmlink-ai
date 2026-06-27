'use client';

import { useQuery } from '@tanstack/react-query';
import {
  buyerOffersApi,
  buyerTransactionsApi,
  notificationsApi,
  recommendationsApi,
} from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { isFuture, parseISO } from 'date-fns';

export function useBuyerNavCounts() {
  const recommendationsQuery = useQuery({
    queryKey: queryKeys.buyer.recommendations(),
    queryFn: recommendationsApi.getRecommendations,
  });
  const offersQuery = useQuery({
    queryKey: queryKeys.buyer.offers({ status: 'pending' }),
    queryFn: buyerOffersApi.getBuyerOffers,
  });
  const transactionsQuery = useQuery({
    queryKey: queryKeys.buyer.transactions(),
    queryFn: buyerTransactionsApi.getBuyerTransactions,
  });
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: notificationsApi.getNotifications,
  });

  const recommendations = recommendationsQuery.data ?? [];
  const offers = offersQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];

  return {
    recommendations: recommendations.filter((r) => r.status === 'new').length,
    offers: offers.filter((o) => o.status === 'pending').length,
    pickups: transactions.filter((t) => {
      if (!t.deliveryDate) return false;
      try {
        return isFuture(parseISO(t.deliveryDate));
      } catch {
        return false;
      }
    }).length,
    notifications: notifications.filter((n) => !n.read).length,
  };
}
