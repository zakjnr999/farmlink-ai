'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { buyerOffersApi, marketplaceApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { BUYER_ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge';
import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDate, formatRelativeDate } from '@/lib/formatting/dates';
import { formatGhs } from '@/lib/formatting/currency';
import type { OfferStatus } from '@/types/offer';
import { toast } from 'sonner';

interface BuyerOfferDetailViewProps {
  offerId: string;
}

function mapBadgeStatus(status: OfferStatus): 'pending' | 'accepted' | 'declined' | 'countered' | 'expired' | 'withdrawn' {
  if (status === 'rejected') return 'declined';
  if (status === 'cancelled' || status === 'withdrawn') return 'withdrawn';
  if (status === 'completed') return 'accepted';
  return status as 'pending' | 'accepted' | 'countered' | 'expired';
}

export function BuyerOfferDetailView({ offerId }: BuyerOfferDetailViewProps) {
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const offerQuery = useQuery({
    queryKey: queryKeys.buyer.offerDetail(offerId),
    queryFn: () => buyerOffersApi.getBuyerOffer(offerId),
  });

  const listingQuery = useQuery({
    queryKey: queryKeys.buyer.marketplaceDetail(offerQuery.data?.listingId ?? ''),
    queryFn: () => marketplaceApi.getMarketplaceListing(offerQuery.data!.listingId),
    enabled: Boolean(offerQuery.data?.listingId),
  });

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await buyerOffersApi.cancelBuyerOffer(offerId);
      toast.success('Offer cancelled');
      queryClient.invalidateQueries({ queryKey: queryKeys.buyer.offers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.buyer.dashboard() });
      offerQuery.refetch();
    } catch {
      toast.error('Could not cancel offer');
    } finally {
      setIsCancelling(false);
      setCancelOpen(false);
    }
  };

  if (offerQuery.isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (offerQuery.isError || !offerQuery.data) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <ErrorState title="Offer not found" onRetry={() => offerQuery.refetch()} />
      </div>
    );
  }

  const offer = offerQuery.data;
  const listing = listingQuery.data;

  return (
    <div className="space-y-8 px-4 py-6 lg:px-8">
      <PageHeader
        title={listing?.title ?? 'Your offer'}
        subtitle={`Sent ${formatRelativeDate(offer.createdAt)}`}
        backButton={
          <Button asChild variant="ghost" size="icon">
            <Link href={BUYER_ROUTES.offers} aria-label="Back to offers">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        }
        actions={<OfferStatusBadge status={mapBadgeStatus(offer.status)} />}
      />

      <section className="supply-band border-soft-border bg-produce-cream/60 p-5 dark:bg-deep-grove/30">
        <p className="exchange-label">Offer terms</p>
        <div className="mt-4 space-y-3">
          <QuantityDisplay amount={offer.quantity} unit={offer.unit} size="lg" />
          <PriceDisplay
            amount={offer.pricePerUnit}
            currency={offer.currency}
            perUnit={offer.unit}
            size="lg"
          />
          <p className="font-heading text-2xl font-bold tabular-nums text-market-green">
            Total {formatGhs(offer.totalAmount, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
          {offer.message && (
            <p className="rounded-lg border border-soft-border bg-warm-paper/80 px-4 py-3 text-sm text-ledger-grey dark:bg-deep-grove/20">
              {offer.message}
            </p>
          )}
          {offer.expiresAt && offer.status === 'pending' && (
            <p className="text-sm text-ledger-grey">
              Expires {formatDate(offer.expiresAt)}
            </p>
          )}
        </div>
      </section>

      {listing && (
        <section className="supply-band border-soft-border p-5">
          <p className="exchange-label">Listing</p>
          <p className="mt-1 font-medium">{listing.title}</p>
          <p className="text-sm text-ledger-grey">
            {listing.farmerName}
            {listing.farmName && ` · ${listing.farmName}`}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={BUYER_ROUTES.marketplaceDetail(listing.id)}>View listing</Link>
          </Button>
        </section>
      )}

      {offer.status === 'pending' && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5"
            onClick={() => setCancelOpen(true)}
          >
            Cancel offer
          </Button>
        </div>
      )}

      {offer.status === 'accepted' && (
        <p className="rounded-lg border border-soft-border bg-market-green/5 px-4 py-3 text-sm text-exchange-ink dark:text-produce-cream">
          The farmer accepted your offer. Check{' '}
          <Link href={BUYER_ROUTES.transactions} className="font-medium text-market-green hover:underline">
            transactions
          </Link>{' '}
          for pickup details.
        </p>
      )}

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this offer?</AlertDialogTitle>
            <AlertDialogDescription>
              The farmer will no longer see this offer. You can send a new offer if supply is still
              available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep offer</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              onClick={handleCancel}
              className="bg-destructive hover:bg-destructive/90"
            >
              Cancel offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
