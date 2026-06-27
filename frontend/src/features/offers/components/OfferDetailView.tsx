'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { offersApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
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
import { toast } from 'sonner';

interface OfferDetailViewProps {
  offerId: string;
}

export function OfferDetailView({ offerId }: OfferDetailViewProps) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<'accept' | 'reject' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.offers.detail(offerId),
    queryFn: () => offersApi.getOffer(offerId),
  });

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await offersApi.acceptOffer(offerId);
      toast.success('Offer accepted');
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.all });
      query.refetch();
    } catch {
      toast.error('Could not accept offer. Try again.');
    } finally {
      setIsProcessing(false);
      setDialog(null);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await offersApi.rejectOffer(offerId);
      toast.success('Offer rejected');
      query.refetch();
    } catch {
      toast.error('Could not reject offer');
    } finally {
      setIsProcessing(false);
      setDialog(null);
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
        <ErrorState title="Offer not found" onRetry={() => query.refetch()} />
      </div>
    );
  }

  const offer = query.data;
  const badgeStatus = (offer.status === 'rejected' ? 'declined' : offer.status) as 'pending';

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-8">
      <PageHeader
        title={offer.buyerName ?? 'Buyer offer'}
        subtitle="Review offer terms before deciding"
        actions={<OfferStatusBadge status={badgeStatus} />}
      />

      <section className="mt-6 space-y-4 rounded-2xl border border-morning-mist bg-warm-paper p-5">
        <h2 className="font-heading text-lg font-semibold">Offer terms</h2>
        <QuantityDisplay amount={offer.quantity} unit={offer.unit} size="lg" />
        <PriceDisplay amount={offer.pricePerUnit} currency="GHS" perUnit={offer.unit} size="lg" />
        <p className="text-lg font-semibold tabular-nums">
          Total: {offer.currency} {offer.totalAmount.toLocaleString()}
        </p>
        {offer.message && (
          <p className="rounded-xl bg-field-cream px-4 py-3 text-sm text-muted-text">
            {offer.message}
          </p>
        )}
      </section>

      {offer.status === 'pending' && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={() => setDialog('accept')}>
            Accept offer
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setDialog('reject')}>
            Reject offer
          </Button>
        </div>
      )}

      <AlertDialog open={dialog === 'accept'} onOpenChange={() => setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept this offer?</AlertDialogTitle>
            <AlertDialogDescription>
              Accepting this offer will reserve the agreed quantity and create a confirmed transaction.
              Payment settlement is handled outside FarmLink in the current MVP.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Not yet</AlertDialogCancel>
            <AlertDialogAction disabled={isProcessing} onClick={handleAccept}>
              Accept offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog === 'reject'} onOpenChange={() => setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this offer?</AlertDialogTitle>
            <AlertDialogDescription>
              The buyer will be notified that you declined this offer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Keep offer</AlertDialogCancel>
            <AlertDialogAction disabled={isProcessing} onClick={handleReject}>
              Reject offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
