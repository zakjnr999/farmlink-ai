import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/brand/BrandMark';

interface BuyerPortalMarkProps {
  className?: string;
  compact?: boolean;
}

export function BuyerPortalMark({ className, compact = false }: BuyerPortalMarkProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <BrandMark size={compact ? 'sm' : 'md'} />
      {!compact && (
        <>
          <p className="font-heading text-sm font-semibold text-market-green dark:text-fresh-leaf">
            Harvest Exchange
          </p>
          <p className="max-w-[14rem] text-xs leading-snug text-ledger-grey dark:text-muted-foreground">
            Smarter produce sourcing for Ghanaian businesses.
          </p>
        </>
      )}
    </div>
  );
}
