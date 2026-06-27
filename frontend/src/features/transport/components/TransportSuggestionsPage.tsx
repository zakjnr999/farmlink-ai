'use client';

import { useQuery } from '@tanstack/react-query';
import { transportApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { TransportPoolSuggestion } from '@/features/transport/components/TransportPoolSuggestion';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';

export function TransportSuggestionsPage() {
  const query = useQuery({
    queryKey: queryKeys.transport.suggestions(),
    queryFn: () => transportApi.getTransportSuggestions(),
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <ErrorState title="Could not load suggestions" onRetry={() => query.refetch()} />
      </div>
    );
  }

  const suggestions = query.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <PageHeader
        title="Transport pooling"
        subtitle="Share delivery costs with nearby farmers when possible"
      />

      <p className="mt-4 rounded-xl bg-morning-mist px-4 py-3 text-sm text-muted-text">
        Transport pooling is an estimated recommendation based on farm proximity and pickup timing.
        Exact savings are only shown when provided by FarmLink.
      </p>

      {suggestions.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No pooling suggestions yet"
          description="When another farmer nearby has a similar pickup date, FarmLink will suggest shared transport."
        />
      ) : (
        <div className="mt-6 space-y-4">
          {suggestions.map((suggestion) => (
            <TransportPoolSuggestion key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      )}
    </div>
  );
}
