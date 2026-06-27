'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { offersApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { OfferStatus } from '@/types/offer';

export function useOffers() {
  const [filter, setFilter] = useState('all');

  const query = useQuery({
    queryKey: queryKeys.offers.list({ filter }),
    queryFn: offersApi.getOffers,
  });

  const all = query.data ?? [];
  const offers =
    filter === 'all' ? all : all.filter((o) => o.status === (filter as OfferStatus));

  return {
    offers,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    filter,
    setFilter,
  };
}
