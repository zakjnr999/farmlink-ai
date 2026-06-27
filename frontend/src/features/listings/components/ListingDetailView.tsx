'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ListingStatusBadge } from '@/components/listings/ListingStatusBadge';
import { AvailabilityWindow } from '@/components/listings/AvailabilityWindow';
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
import { useState } from 'react';
import { toast } from 'sonner';

interface ListingDetailViewProps {
  listingId: string;
}

export function ListingDetailView({ listingId }: ListingDetailViewProps) {
  const [showCancel, setShowCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.listings.detail(listingId),
    queryFn: () => listingsApi.getListing(listingId),
  });

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await listingsApi.patchListing(listingId, { status: 'archived' });
      toast.success('Listing cancelled');
      query.refetch();
    } catch {
      toast.error('Could not cancel listing');
    } finally {
      setIsCancelling(false);
      setShowCancel(false);
    }
  };

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <ErrorState title="Listing not found" onRetry={() => query.refetch()} />
      </div>
    );
  }

  const listing = query.data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-8">
      <PageHeader
        title={listing.title}
        subtitle={listing.produceType}
        actions={<ListingStatusBadge status={listing.status as 'active'} />}
      />

      <section className="mt-6 space-y-4 rounded-2xl border border-morning-mist bg-warm-paper p-5">
        <QuantityDisplay amount={listing.quantity} unit={listing.unit} size="lg" />
        <PriceDisplay amount={listing.pricePerUnit} currency="GHS" perUnit={listing.unit} size="lg" />
        {listing.availableFrom && listing.availableUntil && (
          <AvailabilityWindow
            startDate={listing.availableFrom}
            endDate={listing.availableUntil}
          />
        )}
        <p className="text-sm text-muted-text">
          {listing.district}, {listing.region}
        </p>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/farmer/listings/${listingId}/matches`}>View matches</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/farmer/listings/${listingId}/edit`}>Edit</Link>
        </Button>
        <Button variant="destructive" className="flex-1" onClick={() => setShowCancel(true)}>
          Cancel listing
        </Button>
      </div>

      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Buyers will no longer see this produce. You can list similar produce again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep listing</AlertDialogCancel>
            <AlertDialogAction disabled={isCancelling} onClick={handleCancel}>
              Cancel listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
