'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { ListingStatus } from '@/types/listing';

export function useMyListings() {
  const [filter, setFilter] = useState('all');

  const query = useQuery({
    queryKey: queryKeys.listings.my({ filter }),
    queryFn: listingsApi.getListings,
  });

  const all = query.data ?? [];
  const listings =
    filter === 'all'
      ? all
      : all.filter((l) => l.status === (filter as ListingStatus));

  return {
    listings,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    filter,
    setFilter,
  };
}
