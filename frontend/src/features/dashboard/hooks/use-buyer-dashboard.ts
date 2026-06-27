'use client';

import { useQueries } from '@tanstack/react-query';
import {
  buyerOffersApi,
  buyerTransactionsApi,
  demandsApi,
  notificationsApi,
  recommendationsApi,
} from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { useAuth } from '@/hooks/use-auth';
import type { BuyerDashboardData } from '@/types/buyer';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function useBuyerDashboard() {
  const { buyerProfile } = useAuth();
  const hour = toZonedTime(new Date(), 'Africa/Accra').getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.buyer.recommendations(),
        queryFn: recommendationsApi.getRecommendations,
      },
      {
        queryKey: queryKeys.buyer.demands(),
        queryFn: demandsApi.getDemands,
      },
      {
        queryKey: queryKeys.buyer.offers(),
        queryFn: buyerOffersApi.getBuyerOffers,
      },
      {
        queryKey: queryKeys.buyer.transactions(),
        queryFn: buyerTransactionsApi.getBuyerTransactions,
      },
      {
        queryKey: queryKeys.notifications.list({ limit: 5 }),
        queryFn: notificationsApi.getNotifications,
      },
    ],
  });

  const [recsQ, demandsQ, offersQ, txnsQ, notifsQ] = results;
  const recommendations = recsQ.data ?? [];
  const demands = demandsQ.data ?? [];
  const offers = offersQ.data ?? [];
  const transactions = txnsQ.data ?? [];
  const notifications = notifsQ.data ?? [];

  const pendingOffers = offers.filter((o) => o.status === 'pending');
  const activeDemands = demands.filter((d) => d.status !== 'inactive');
  const upcomingPickups = transactions.filter(
    (t) => t.status === 'payment_confirmed' || t.status === 'in_transit',
  );
  const committedValue = transactions
    .filter((t) => !['cancelled', 'disputed'].includes(t.status))
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const demandCoverage = activeDemands.map((d) => {
    const percent =
      d.status === 'matched'
        ? 100
        : d.status === 'partially_matched'
          ? 75
          : d.matchingListingsCount
            ? Math.min(100, d.matchingListingsCount * 25)
            : 0;
    return {
      produce: d.produceCategory,
      coveragePercent: percent,
      status: (percent >= 100 ? 'full' : percent > 0 ? 'partial' : 'none') as
        | 'full'
        | 'partial'
        | 'none',
    };
  });

  const activityByWeek = [
    { week: format(new Date(Date.now() - 21 * 86400000), 'd MMM'), offers: 2, transactions: 0 },
    { week: format(new Date(Date.now() - 14 * 86400000), 'd MMM'), offers: 3, transactions: 1 },
    { week: format(new Date(Date.now() - 7 * 86400000), 'd MMM'), offers: 4, transactions: 1 },
    { week: format(new Date(), 'd MMM'), offers: pendingOffers.length, transactions: 0 },
  ];

  const data: BuyerDashboardData = {
    businessName: buyerProfile?.businessName ?? 'Your business',
    greeting,
    summaryLine: `You have ${recommendations.length} recommended supplies and ${pendingOffers.length} offers awaiting farmer response.`,
    activeRecommendations: recommendations.length,
    openDemands: activeDemands.length,
    pendingOffers: pendingOffers.length,
    upcomingPickups: upcomingPickups.length,
    committedValue,
    currency: 'GHS',
    demandCoverage,
    topRecommendations: recommendations.slice(0, 5),
    pendingOffersList: pendingOffers.slice(0, 5),
    upcomingPickupsList: upcomingPickups.slice(0, 5),
    recentNotifications: notifications.slice(0, 5),
    activityByWeek,
  };

  return {
    data,
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    refetch: () => results.forEach((r) => r.refetch()),
  };
}
