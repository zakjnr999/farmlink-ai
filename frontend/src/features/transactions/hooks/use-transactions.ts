'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { TransactionStatus } from '@/types/transaction';

export function useTransactions() {
  const [filter, setFilter] = useState('all');

  const query = useQuery({
    queryKey: queryKeys.transactions.list({ filter }),
    queryFn: transactionsApi.getTransactions,
  });

  const all = query.data ?? [];
  const transactions =
    filter === 'all'
      ? all
      : all.filter((t) => t.status === (filter as TransactionStatus));

  return {
    transactions,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    filter,
    setFilter,
  };
}
