'use client';

import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { PageHeader } from '@/components/layout/PageHeader';
import { BuyerMatchSummary } from '@/components/offers/BuyerMatchSummary';
import { MatchDetailExplanation } from '@/features/matches/components/MatchDetailExplanation';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { formatMatchLabel } from '@/lib/formatting/status';

interface MatchesListViewProps {
  listingId: string;
}

export function MatchesListView({ listingId }: MatchesListViewProps) {
  const query = useQuery({
    queryKey: queryKeys.listings.matches(listingId),
    queryFn: () => matchesApi.getListingMatches(listingId),
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
        <ErrorState title="Could not load matches" onRetry={() => query.refetch()} />
      </div>
    );
  }

  const matches = query.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <PageHeader
        title="Buyer matches"
        subtitle="Suitable buyers for your listing"
      />

      <p className="mt-4 rounded-xl bg-morning-mist px-4 py-3 text-sm text-muted-text">
        Match scores help identify suitable buyers. They do not guarantee that a buyer will make or complete an offer.
      </p>

      {matches.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No matches yet"
          description="FarmLink is still checking for suitable buyers for this listing."
        />
      ) : (
        <div className="mt-6 space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="space-y-3">
              <BuyerMatchSummary
                buyerName={match.buyerName}
                location={match.region}
                matchScore={match.score}
                highlights={[
                  match.notes ?? '',
                  match.label ? formatMatchLabel(match.label) : '',
                ].filter(Boolean)}
              />
              <MatchDetailExplanation match={match} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
