'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutGrid,
  List,
  MapPin,
  Package,
  Scale,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { marketplaceApi, categoriesApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { BUYER_ROUTES } from '@/constants/routes';
import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';
import type { MarketplaceFilters, MarketplaceListing } from '@/types/buyer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { MatchScoreStrip } from '@/components/offers/MatchScoreStrip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatQuantity } from '@/lib/formatting/quantities';
import { formatDistanceKm } from '@/lib/formatting/distances';
import { useComparison } from '@/providers/ComparisonProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'match_score', label: 'Best match' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'lowest_price', label: 'Lowest price' },
  { value: 'highest_quantity', label: 'Highest quantity' },
  { value: 'earliest_availability', label: 'Earliest availability' },
  { value: 'newest', label: 'Newest listed' },
] as const;

type ViewMode = 'list' | 'board';

function MarketplaceListingRow({
  listing,
  viewMode,
  onCompare,
  isCompared,
  compareDisabled,
}: {
  listing: MarketplaceListing;
  viewMode: ViewMode;
  onCompare: () => void;
  isCompared: boolean;
  compareDisabled: boolean;
}) {
  return (
    <article
      className={cn(
        'border-soft-border transition-colors hover:bg-produce-cream/40 dark:hover:bg-deep-grove/20',
        viewMode === 'list'
          ? 'flex flex-col gap-4 border-b py-5 sm:flex-row sm:items-center sm:justify-between'
          : 'supply-band border p-4',
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={BUYER_ROUTES.marketplaceDetail(listing.id)}
            className="font-heading font-semibold text-exchange-ink hover:text-market-green dark:text-produce-cream"
          >
            {listing.title}
          </Link>
          {listing.farmerVerified && (
            <Badge variant="leaf" className="gap-1">
              <ShieldCheck className="size-3" aria-hidden />
              Verified
            </Badge>
          )}
        </div>
        <p className="text-sm text-ledger-grey">{listing.produceType}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ledger-grey">
          <span className="inline-flex items-center gap-1">
            <Package className="size-3.5" aria-hidden />
            {formatQuantity(listing.availableQuantity ?? listing.quantity, listing.unit)}
          </span>
          <PriceDisplay
            amount={listing.pricePerUnit}
            currency={listing.currency}
            perUnit={listing.unit}
            size="sm"
          />
          {listing.distanceKm != null && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {formatDistanceKm(listing.distanceKm)} · {listing.town ?? listing.district}
            </span>
          )}
        </div>
        {listing.matchScore != null && (
          <MatchScoreStrip score={listing.matchScore} className="max-w-xs" />
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={compareDisabled && !isCompared}
          onClick={onCompare}
          className={cn(isCompared && 'border-market-green text-market-green')}
        >
          <Scale className="mr-1 size-3.5" aria-hidden />
          {isCompared ? 'In compare' : 'Compare'}
        </Button>
        <Button asChild size="sm" className="bg-market-green hover:bg-market-green/90">
          <Link href={BUYER_ROUTES.marketplaceDetail(listing.id)}>View supply</Link>
        </Button>
      </div>
    </article>
  );
}

export function MarketplacePageContent() {
  const { addItem, isInComparison, isFull, items: compareItems } = useComparison();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');
  const [sort, setSort] = useState<string>('match_score');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);

  const filters: MarketplaceFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category || undefined,
      region: region || undefined,
      sort,
      verifiedOnly: verifiedOnly || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, category, region, sort, verifiedOnly, page],
  );

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.getActiveCategories(),
  });

  const listingsQuery = useQuery({
    queryKey: queryKeys.buyer.marketplace(filters as Record<string, unknown>),
    queryFn: () => marketplaceApi.getMarketplaceListings(filters),
  });

  const listings = listingsQuery.data ?? [];
  const hasNextPage = listings.length === PAGE_SIZE;

  const handleCompare = (listing: MarketplaceListing) => {
    if (isInComparison(listing.id)) return;
    if (isFull) {
      toast.error('Compare list is full (max 3 listings).');
      return;
    }
    addItem(listing);
    toast.success('Added to compare');
  };

  if (listingsQuery.isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  if (listingsQuery.isError) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <ErrorState title="Could not load marketplace" onRetry={() => listingsQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      <PageHeader
        title="Harvest Exchange"
        subtitle="Browse farmer supply across Ghana"
        actions={
          compareItems.length > 0 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={BUYER_ROUTES.compare}>
                Compare ({compareItems.length})
              </Link>
            </Button>
          ) : undefined
        }
      />

      <section className="supply-band space-y-4 border-soft-border bg-produce-cream/50 p-4 dark:bg-deep-grove/20">
        <p className="exchange-label">Filter supply</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Label htmlFor="marketplace-search" className="sr-only">
              Search
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ledger-grey"
                aria-hidden
              />
              <Input
                id="marketplace-search"
                placeholder="Search produce, farmer, or location…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-warm-paper pl-9"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="marketplace-category">Category</Label>
            <Select
              value={category || 'all'}
              onValueChange={(v) => {
                setCategory(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger id="marketplace-category" className="mt-1.5 bg-warm-paper">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(categoriesQuery.data ?? []).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="marketplace-region">Region</Label>
            <Select
              value={region || 'all'}
              onValueChange={(v) => {
                setRegion(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger id="marketplace-region" className="mt-1.5 bg-warm-paper">
                <SelectValue placeholder="All regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {GHANA_REGION_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="marketplace-sort">Sort by</Label>
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                setPage(1);
              }}
            >
              <SelectTrigger id="marketplace-sort" className="mt-1.5 bg-warm-paper">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <label className="flex min-h-[var(--touch-target)] cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={verifiedOnly}
                onCheckedChange={(checked) => {
                  setVerifiedOnly(checked === true);
                  setPage(1);
                }}
              />
              Verified farmers only
            </label>
          </div>
          <div className="flex items-end justify-end gap-1 sm:col-span-2 lg:col-span-3">
            <Button
              type="button"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
            >
              <List className="mr-1 size-4" aria-hidden />
              List
            </Button>
            <Button
              type="button"
              variant={viewMode === 'board' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('board')}
              aria-pressed={viewMode === 'board'}
            >
              <LayoutGrid className="mr-1 size-4" aria-hidden />
              Board
            </Button>
          </div>
        </div>
      </section>

      {listings.length === 0 ? (
        <EmptyState
          title="No supply matches your filters"
          description="Try widening your search, removing region filters, or browsing all categories."
          actionLabel="Clear filters"
          onAction={() => {
            setSearch('');
            setCategory('');
            setRegion('');
            setVerifiedOnly(false);
            setSort('match_score');
            setPage(1);
          }}
        />
      ) : (
        <>
          <div
            className={cn(
              viewMode === 'board' && 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3',
            )}
          >
            {listings.map((listing) => (
              <MarketplaceListingRow
                key={listing.id}
                listing={listing}
                viewMode={viewMode}
                isCompared={isInComparison(listing.id)}
                compareDisabled={isFull}
                onCompare={() => handleCompare(listing)}
              />
            ))}
          </div>

          <nav
            className="flex items-center justify-between border-t border-soft-border pt-4"
            aria-label="Marketplace pagination"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm tabular-nums text-ledger-grey">Page {page}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </nav>
        </>
      )}
    </div>
  );
}
