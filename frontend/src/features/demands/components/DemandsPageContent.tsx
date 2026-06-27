'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { demandsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { BUYER_ROUTES } from '@/constants/routes';
import type { BuyerDemand, DemandStatus } from '@/types/buyer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { DemandCoverageIndicator } from '@/components/commerce/DemandCoverageIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatQuantity } from '@/lib/formatting/quantities';
import { formatDate } from '@/lib/formatting/dates';
import { formatGhs } from '@/lib/formatting/currency';
import { formatDemandCoverageStatus } from '@/lib/formatting/buyer';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<DemandStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  partially_matched: 'Partially matched',
  matched: 'Matched',
  unmatched: 'Unmatched',
};

const STATUS_VARIANT: Record<
  DemandStatus,
  'leaf' | 'harvest' | 'muted' | 'clay' | 'outline'
> = {
  active: 'outline',
  inactive: 'muted',
  partially_matched: 'harvest',
  matched: 'leaf',
  unmatched: 'clay',
};

function coveragePercent(demand: BuyerDemand): number {
  if (demand.status === 'matched') return 100;
  if (demand.status === 'partially_matched') {
    const count = demand.matchingListingsCount ?? 0;
    return Math.min(90, Math.max(25, count * 25));
  }
  if ((demand.matchingListingsCount ?? 0) > 0) {
    return Math.min(50, demand.matchingListingsCount! * 15);
  }
  return 0;
}

function DemandRow({ demand }: { demand: BuyerDemand }) {
  const percent = coveragePercent(demand);
  const coverageStatus = formatDemandCoverageStatus(percent);

  return (
    <li className="flex flex-col gap-4 border-b border-soft-border py-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={BUYER_ROUTES.demandDetail(demand.id)}
            className="font-heading font-semibold text-exchange-ink hover:text-market-green dark:text-produce-cream"
          >
            {demand.produceCategory}
          </Link>
          <Badge variant={STATUS_VARIANT[demand.status]}>{STATUS_LABELS[demand.status]}</Badge>
          {demand.isRecurring && (
            <Badge variant="outline" className="capitalize">
              {demand.frequency ?? 'Recurring'}
            </Badge>
          )}
        </div>
        <p className="text-sm text-ledger-grey">
          {formatQuantity(demand.quantityMin, demand.unit)} –{' '}
          {formatQuantity(demand.quantityMax, demand.unit)}
          {demand.preferredMaxPrice != null &&
            ` · Max ${formatGhs(demand.preferredMaxPrice)}/${demand.unit}`}
        </p>
        <p className="text-sm text-ledger-grey">
          Needed from {formatDate(demand.requiredFrom)}
          {demand.requiredUntil && ` until ${formatDate(demand.requiredUntil)}`}
          {' · '}
          {demand.preferredRegions.join(', ')}
        </p>
        <DemandCoverageIndicator
          produce={demand.produceCategory}
          percent={percent}
          status={coverageStatus}
          className="max-w-md"
        />
        {(demand.matchingListingsCount ?? 0) > 0 && (
          <p className="text-xs text-market-green">
            {demand.matchingListingsCount} matching listing
            {demand.matchingListingsCount === 1 ? '' : 's'} found
          </p>
        )}
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link href={BUYER_ROUTES.demandDetail(demand.id)}>View demand</Link>
      </Button>
    </li>
  );
}

export function DemandsPageContent() {
  const query = useQuery({
    queryKey: queryKeys.buyer.demands(),
    queryFn: () => demandsApi.getDemands(),
  });

  const sortedDemands = useMemo(() => {
    const order: Record<DemandStatus, number> = {
      active: 0,
      partially_matched: 1,
      unmatched: 2,
      matched: 3,
      inactive: 4,
    };
    return [...(query.data ?? [])].sort(
      (a, b) => (order[a.status] ?? 99) - (order[b.status] ?? 99),
    );
  }, [query.data]);

  if (query.isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <ErrorState title="Could not load demands" onRetry={() => query.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      <PageHeader
        title="Procurement demands"
        subtitle="Tell FarmLink what produce you need and when"
        actions={
          <Button asChild className="bg-market-green hover:bg-market-green/90">
            <Link href={BUYER_ROUTES.demandNew}>
              <Plus className="mr-1 size-4" aria-hidden />
              New demand
            </Link>
          </Button>
        }
      />

      {sortedDemands.length === 0 ? (
        <EmptyState
          title="No demands yet"
          description="Create a produce demand so FarmLink can recommend matching farmer listings."
          actionLabel="Create demand"
          actionHref={BUYER_ROUTES.demandNew}
        />
      ) : (
        <ul className={cn('divide-y divide-soft-border')}>
          {sortedDemands.map((demand) => (
            <DemandRow key={demand.id} demand={demand} />
          ))}
        </ul>
      )}
    </div>
  );
}
