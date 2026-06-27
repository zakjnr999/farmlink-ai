'use client';

import { cn } from '@/lib/utils';

interface DemandCoverageIndicatorProps {
  produce: string;
  percent: number;
  status: 'full' | 'partial' | 'none';
  className?: string;
}

const statusCopy = {
  full: 'Fully covered',
  partial: 'Partially covered',
  none: 'No matching supply yet',
};

export function DemandCoverageIndicator({
  produce,
  percent,
  status,
  className,
}: DemandCoverageIndicatorProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{produce}</span>
        <span className="tabular-nums text-ledger-grey">
          {status === 'none' ? statusCopy.none : `${percent}% covered`}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-cool-mist dark:bg-deep-grove"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${produce}: ${statusCopy[status]}`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            status === 'full' && 'bg-market-green',
            status === 'partial' && 'bg-harvest-gold',
            status === 'none' && 'bg-basket-clay/50 w-0',
          )}
          style={{ width: status === 'none' ? '0%' : `${Math.min(100, percent)}%` }}
        />
      </div>
      <p className="sr-only">{statusCopy[status]}</p>
    </div>
  );
}
