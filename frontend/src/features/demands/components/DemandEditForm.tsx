'use client';

import { useQuery } from '@tanstack/react-query';
import { demandsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { DemandForm } from '@/features/demands/components/DemandForm';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';

interface DemandEditFormProps {
  demandId: string;
}

export function DemandEditForm({ demandId }: DemandEditFormProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.buyer.demandDetail(demandId),
    queryFn: () => demandsApi.getDemand(demandId),
  });

  if (isLoading) return <LoadingSkeleton variant="detail" />;
  if (isError || !data) {
    return <ErrorState title="Could not load demand" onRetry={() => refetch()} />;
  }

  return <DemandForm mode="edit" demand={data} />;
}
