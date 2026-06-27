'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { buyerOffersApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { BUYER_ROUTES } from '@/constants/routes';
import type { MarketplaceListing } from '@/types/buyer';
import { PriceDisplay } from '@/components/marketplace/PriceDisplay';
import { QuantityDisplay } from '@/components/marketplace/QuantityDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatGhs } from '@/lib/formatting/currency';
import { formatQuantity } from '@/lib/formatting/quantities';
import { toast } from 'sonner';

const offerSchema = z.object({
  quantity: z.coerce
    .number({ invalid_type_error: 'Enter a quantity.' })
    .positive('Quantity must be greater than zero.'),
  pricePerUnit: z.coerce
    .number({ invalid_type_error: 'Enter a price per unit.' })
    .positive('Price must be greater than zero.'),
  proposedPickupDate: z.string().optional().or(z.literal('')),
  message: z.string().max(500, 'Message must be under 500 characters.').optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface OfferComposerProps {
  listing: MarketplaceListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demandId?: string;
  recommendationId?: string;
  defaultQuantity?: number;
  defaultPrice?: number;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
}

export function OfferComposer({
  listing,
  open,
  onOpenChange,
  demandId,
  recommendationId,
  defaultQuantity,
  defaultPrice,
}: OfferComposerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<OfferFormValues | null>(null);

  const maxQuantity = listing.availableQuantity ?? listing.quantity;
  const minQuantity = listing.minimumOrder ?? 1;

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      quantity: defaultQuantity ?? minQuantity,
      pricePerUnit: defaultPrice ?? listing.pricePerUnit,
      proposedPickupDate: '',
      message: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        quantity: defaultQuantity ?? minQuantity,
        pricePerUnit: defaultPrice ?? listing.pricePerUnit,
        proposedPickupDate: '',
        message: '',
      });
    }
  }, [open, defaultQuantity, defaultPrice, listing, minQuantity, form]);

  const quantity = form.watch('quantity');
  const pricePerUnit = form.watch('pricePerUnit');
  const total =
    Number.isFinite(quantity) && Number.isFinite(pricePerUnit)
      ? quantity * pricePerUnit
      : 0;

  const validateAndConfirm = form.handleSubmit((values) => {
    if (values.quantity < minQuantity) {
      form.setError('quantity', {
        message: `Minimum order is ${formatQuantity(minQuantity, listing.unit)}.`,
      });
      return;
    }
    if (values.quantity > maxQuantity) {
      form.setError('quantity', {
        message: `Only ${formatQuantity(maxQuantity, listing.unit)} available.`,
      });
      return;
    }
    setPendingValues(values);
    setConfirmOpen(true);
  });

  const submitOffer = async () => {
    if (!pendingValues) return;
    try {
      const offer = await buyerOffersApi.createOffer({
        listingId: listing.id,
        quantity: pendingValues.quantity,
        unit: listing.unit,
        pricePerUnit: pendingValues.pricePerUnit,
        proposedPickupDate: pendingValues.proposedPickupDate || undefined,
        message: pendingValues.message || undefined,
        demandId,
        recommendationId,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.buyer.offers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.buyer.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.buyer.recommendations() });
      toast.success('Offer sent to farmer');
      setConfirmOpen(false);
      onOpenChange(false);
      router.push(BUYER_ROUTES.offerDetail(offer.id));
    } catch {
      toast.error('Could not send offer. Try again.');
      setConfirmOpen(false);
    }
  };

  const formBody = (
    <div className="space-y-4">
      <div className="rounded-lg border border-soft-border bg-produce-cream/50 p-3 text-sm dark:bg-deep-grove/20">
        <p className="font-medium text-exchange-ink dark:text-produce-cream">{listing.title}</p>
        <p className="mt-1 text-ledger-grey">{listing.farmerName}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <QuantityDisplay amount={maxQuantity} unit={listing.unit} size="sm" />
          <PriceDisplay
            amount={listing.pricePerUnit}
            currency={listing.currency}
            perUnit={listing.unit}
            size="sm"
          />
        </div>
        {listing.minimumOrder != null && listing.minimumOrder > 0 && (
          <p className="mt-2 text-xs text-ledger-grey">
            Minimum order: {formatQuantity(listing.minimumOrder, listing.unit)}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="offer-quantity">Quantity ({listing.unit})</Label>
        <Input
          id="offer-quantity"
          type="number"
          min={minQuantity}
          max={maxQuantity}
          className="mt-1.5 bg-warm-paper"
          {...form.register('quantity')}
        />
        {form.formState.errors.quantity && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.quantity.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="offer-price">Your price per {listing.unit}</Label>
        <Input
          id="offer-price"
          type="number"
          min={0}
          step="0.01"
          className="mt-1.5 bg-warm-paper"
          {...form.register('pricePerUnit')}
        />
        {form.formState.errors.pricePerUnit && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.pricePerUnit.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="offer-pickup">Proposed pickup date (optional)</Label>
        <Input
          id="offer-pickup"
          type="date"
          className="mt-1.5 bg-warm-paper"
          {...form.register('proposedPickupDate')}
        />
      </div>

      <div>
        <Label htmlFor="offer-message">Message to farmer (optional)</Label>
        <Textarea
          id="offer-message"
          rows={3}
          className="mt-1.5 bg-warm-paper"
          placeholder="Pickup preferences, quality requirements, etc."
          {...form.register('message')}
        />
        {form.formState.errors.message && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.message.message}
          </p>
        )}
      </div>

      <div className="supply-band border-soft-border p-4">
        <p className="exchange-label">Offer total preview</p>
        <p className="font-heading mt-1 text-2xl font-bold tabular-nums text-market-green">
          {formatGhs(total, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </p>
        <p className="mt-1 text-xs text-ledger-grey">
          {formatQuantity(Number(quantity) || 0, listing.unit)} ×{' '}
          {formatGhs(Number(pricePerUnit) || 0, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          /{listing.unit}
        </p>
      </div>
    </div>
  );

  const confirmDialog = (
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm your offer</DialogTitle>
          <DialogDescription>
            You are offering {formatQuantity(pendingValues?.quantity ?? 0, listing.unit)} at{' '}
            {formatGhs(pendingValues?.pricePerUnit ?? 0)} per {listing.unit} — total{' '}
            {formatGhs((pendingValues?.quantity ?? 0) * (pendingValues?.pricePerUnit ?? 0))}.
            The farmer will review and respond.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
            Go back
          </Button>
          <Button
            type="button"
            className="bg-market-green hover:bg-market-green/90"
            onClick={submitOffer}
          >
            Send offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Send offer</SheetTitle>
              <SheetDescription>
                Propose terms to {listing.farmerName} for this listing.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={validateAndConfirm} className="mt-4">
              {formBody}
              <SheetFooter className="mt-6 gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-market-green hover:bg-market-green/90">
                  Review & send
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
        {confirmDialog}
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send offer</DialogTitle>
            <DialogDescription>
              Propose terms to {listing.farmerName} for this listing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={validateAndConfirm}>
            {formBody}
            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-market-green hover:bg-market-green/90">
                Review & send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </>
  );
}
