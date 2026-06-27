'use client';

import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { BUYER_ROUTES } from '@/constants/routes';
import { useComparison } from '@/providers/ComparisonProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { MatchScoreStrip } from '@/components/offers/MatchScoreStrip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatQuantity } from '@/lib/formatting/quantities';
import { formatDistanceKm } from '@/lib/formatting/distances';
import { formatDate } from '@/lib/formatting/dates';
import { cn } from '@/lib/utils';

const COMPARE_ROWS = [
  { key: 'produce', label: 'Produce' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'price', label: 'Price per unit' },
  { key: 'location', label: 'Location' },
  { key: 'distance', label: 'Distance' },
  { key: 'harvest', label: 'Harvest date' },
  { key: 'available', label: 'Available from' },
  { key: 'verified', label: 'Farmer verified' },
  { key: 'match', label: 'Match score' },
] as const;

export function ComparePageContent() {
  const { items, removeItem, clearItems } = useComparison();

  if (items.length === 0) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <PageHeader
          title="Compare supply"
          subtitle="Side-by-side comparison of up to 3 listings"
          backButton={
            <Button asChild variant="ghost" size="icon">
              <Link href={BUYER_ROUTES.marketplace} aria-label="Back to marketplace">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
          }
        />
        <EmptyState
          title="Nothing to compare yet"
          description="Add listings from the marketplace to compare price, quantity, distance, and match scores."
          actionLabel="Browse marketplace"
          actionHref={BUYER_ROUTES.marketplace}
        />
      </div>
    );
  }

  const getCellValue = (key: (typeof COMPARE_ROWS)[number]['key'], index: number) => {
    const listing = items[index];
    if (!listing) return '—';

    switch (key) {
      case 'produce':
        return listing.produceType;
      case 'quantity':
        return formatQuantity(listing.availableQuantity ?? listing.quantity, listing.unit);
      case 'price':
        return (
          <PriceDisplay
            amount={listing.pricePerUnit}
            currency={listing.currency}
            perUnit={listing.unit}
            size="sm"
          />
        );
      case 'location':
        return [listing.town, listing.district, listing.region].filter(Boolean).join(', ');
      case 'distance':
        return listing.distanceKm != null ? formatDistanceKm(listing.distanceKm) : '—';
      case 'harvest':
        return listing.harvestDate ? formatDate(listing.harvestDate) : '—';
      case 'available':
        return formatDate(listing.availableFrom);
      case 'verified':
        return listing.farmerVerified ? (
          <Badge variant="leaf">Verified</Badge>
        ) : (
          'Not verified'
        );
      case 'match':
        return listing.matchScore != null ? (
          <MatchScoreStrip score={listing.matchScore} className="max-w-[140px]" />
        ) : (
          '—'
        );
      default:
        return '—';
    }
  };

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      <PageHeader
        title="Compare supply"
        subtitle={`Comparing ${items.length} of 3 listings`}
        backButton={
          <Button asChild variant="ghost" size="icon">
            <Link href={BUYER_ROUTES.marketplace} aria-label="Back to marketplace">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        }
        actions={
          <Button type="button" variant="outline" size="sm" onClick={clearItems}>
            Clear all
          </Button>
        }
      />

      {/* Mobile: stacked cards */}
      <div className="space-y-4 lg:hidden">
        {items.map((listing) => (
          <article
            key={listing.id}
            className="supply-band relative border-soft-border bg-produce-cream/50 p-4 dark:bg-deep-grove/20"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => removeItem(listing.id)}
              aria-label={`Remove ${listing.title} from compare`}
            >
              <X className="size-4" />
            </Button>
            <Link
              href={BUYER_ROUTES.marketplaceDetail(listing.id)}
              className="font-heading pr-10 font-semibold text-exchange-ink hover:text-market-green dark:text-produce-cream"
            >
              {listing.title}
            </Link>
            <p className="mt-1 text-sm text-ledger-grey">{listing.farmerName}</p>
            <dl className="mt-4 space-y-2 text-sm">
              {COMPARE_ROWS.map((row) => (
                <div key={row.key} className="flex justify-between gap-4 border-b border-soft-border/50 py-2">
                  <dt className="text-ledger-grey">{row.label}</dt>
                  <dd className="text-right font-medium">{getCellValue(row.key, items.indexOf(listing))}</dd>
                </div>
              ))}
            </dl>
            <Button asChild className="mt-4 w-full bg-market-green hover:bg-market-green/90" size="sm">
              <Link href={BUYER_ROUTES.marketplaceDetail(listing.id)}>View listing</Link>
            </Button>
          </article>
        ))}
      </div>

      {/* Desktop: comparison table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-soft-border">
              <th scope="col" className="exchange-label py-3 pr-4 text-left">
                Attribute
              </th>
              {items.map((listing) => (
                <th
                  key={listing.id}
                  scope="col"
                  className="min-w-[180px] border-l border-soft-border px-4 py-3 text-left align-top"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={BUYER_ROUTES.marketplaceDetail(listing.id)}
                      className="font-heading font-semibold text-exchange-ink hover:text-market-green dark:text-produce-cream"
                    >
                      {listing.title}
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      onClick={() => removeItem(listing.id)}
                      aria-label={`Remove ${listing.title}`}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <p className="mt-1 font-normal text-ledger-grey">{listing.farmerName}</p>
                </th>
              ))}
              {items.length < 3 &&
                Array.from({ length: 3 - items.length }).map((_, i) => (
                  <th
                    key={`empty-${i}`}
                    scope="col"
                    className={cn(
                      'min-w-[180px] border-l border-dashed border-soft-border px-4 py-3 text-left text-ledger-grey',
                    )}
                  >
                    <Link href={BUYER_ROUTES.marketplace} className="text-market-green hover:underline">
                      + Add listing
                    </Link>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.key} className="border-b border-soft-border">
                <th scope="row" className="py-3 pr-4 text-left font-medium text-ledger-grey">
                  {row.label}
                </th>
                {items.map((listing, index) => (
                  <td
                    key={listing.id}
                    className="border-l border-soft-border px-4 py-3 align-top"
                  >
                    {getCellValue(row.key, index)}
                  </td>
                ))}
                {items.length < 3 &&
                  Array.from({ length: 3 - items.length }).map((_, i) => (
                    <td key={`empty-cell-${i}`} className="border-l border-dashed border-soft-border px-4 py-3">
                      —
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
