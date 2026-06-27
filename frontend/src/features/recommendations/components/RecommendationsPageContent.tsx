'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Package } from 'lucide-react';
import { recommendationsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { BUYER_ROUTES } from '@/constants/routes';
import type { BuyerRecommendation } from '@/types/buyer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { MatchScoreStrip } from '@/components/offers/MatchScoreStrip';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatQuantity } from '@/lib/formatting/quantities';
import { formatRelativeDate } from '@/lib/formatting/dates';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'offer_sent', label: 'Offer sent' },
  { value: 'converted', label: 'Converted' },
  { value: 'expired', label: 'Expired' },
] as const;

const STATUS_LABELS: Record<BuyerRecommendation['status'], string> = {
  new: 'New',
  viewed: 'Viewed',
  offer_sent: 'Offer sent',
  converted: 'Converted',
  expired: 'Expired',
};

function RecommendationRow({ recommendation }: { recommendation: BuyerRecommendation }) {
  return (
    <li className="flex flex-col gap-4 border-b border-soft-border py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={BUYER_ROUTES.recommendationDetail(recommendation.id)}
            className="font-heading font-semibold text-exchange-ink hover:text-market-green dark:text-produce-cream"
          >
            {recommendation.listingTitle}
          </Link>
          <Badge variant={recommendation.status === 'new' ? 'harvest' : 'muted'}>
            {STATUS_LABELS[recommendation.status]}
          </Badge>
        </div>
        <p className="text-sm text-ledger-grey">
          {recommendation.produceType} · {recommendation.farmerName}
          {recommendation.farmName && ` · ${recommendation.farmName}`}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ledger-grey">
          <span className="inline-flex items-center gap-1">
            <Package className="size-3.5" aria-hidden />
            {formatQuantity(recommendation.quantity, recommendation.unit)}
          </span>
          <PriceDisplay
            amount={recommendation.pricePerUnit}
            currency={recommendation.currency}
            perUnit={recommendation.unit}
            size="sm"
          />
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {recommendation.distanceKm} km · {recommendation.town ?? recommendation.district}
          </span>
        </div>
        <MatchScoreStrip
          score={recommendation.score}
          label={recommendation.scoreLabel}
          className="max-w-xs"
        />
        <p className="text-xs text-ledger-grey">
          Recommended {formatRelativeDate(recommendation.createdAt)}
        </p>
      </div>
      <Button asChild size="sm" className="shrink-0 bg-market-green hover:bg-market-green/90">
        <Link href={BUYER_ROUTES.recommendationDetail(recommendation.id)}>Review match</Link>
      </Button>
    </li>
  );
}

export function RecommendationsPageContent() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [produceFilter, setProduceFilter] = useState('all');
  const [minScore, setMinScore] = useState('0');

  const query = useQuery({
    queryKey: queryKeys.buyer.recommendations(),
    queryFn: () => recommendationsApi.getRecommendations(),
  });

  const produceOptions = useMemo(() => {
    const types = new Set((query.data ?? []).map((r) => r.produceType));
    return Array.from(types).sort();
  }, [query.data]);

  const filtered = useMemo(() => {
    let rows = query.data ?? [];
    if (statusFilter !== 'all') {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    if (produceFilter !== 'all') {
      rows = rows.filter((r) => r.produceType === produceFilter);
    }
    const min = Number(minScore);
    if (min > 0) {
      rows = rows.filter((r) => r.score >= min);
    }
    return [...rows].sort((a, b) => b.score - a.score);
  }, [query.data, statusFilter, produceFilter, minScore]);

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
        <ErrorState title="Could not load recommendations" onRetry={() => query.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      <PageHeader
        title="Recommended supply"
        subtitle="AI-ranked listings matched to your active demands"
      />

      <section className="supply-band grid gap-4 border-soft-border bg-produce-cream/50 p-4 sm:grid-cols-3 dark:bg-deep-grove/20">
        <p className="exchange-label sm:col-span-3">Filter recommendations</p>
        <div>
          <Label htmlFor="rec-status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="rec-status" className="mt-1.5 bg-warm-paper">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rec-produce">Produce</Label>
          <Select value={produceFilter} onValueChange={setProduceFilter}>
            <SelectTrigger id="rec-produce" className="mt-1.5 bg-warm-paper">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All produce</SelectItem>
              {produceOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rec-score">Minimum score</Label>
          <Select value={minScore} onValueChange={setMinScore}>
            <SelectTrigger id="rec-score" className="mt-1.5 bg-warm-paper">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any score</SelectItem>
              <SelectItem value="50">50%+</SelectItem>
              <SelectItem value="75">75%+</SelectItem>
              <SelectItem value="90">90%+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          title="No recommendations match your filters"
          description={
            (query.data?.length ?? 0) === 0
              ? 'Create a produce demand so FarmLink can find suitable farmer listings for your business.'
              : 'Try adjusting your filters to see more matches.'
          }
          actionLabel={(query.data?.length ?? 0) === 0 ? 'Create demand' : undefined}
          actionHref={(query.data?.length ?? 0) === 0 ? BUYER_ROUTES.demandNew : undefined}
        />
      ) : (
        <ul className="divide-y divide-soft-border">
          {filtered.map((rec) => (
            <RecommendationRow key={rec.id} recommendation={rec} />
          ))}
        </ul>
      )}
    </div>
  );
}
