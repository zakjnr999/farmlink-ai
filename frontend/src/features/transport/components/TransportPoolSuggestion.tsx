import type { TransportSuggestion } from '@/types/transport';
import { formatGhs } from '@/lib/formatting/currency';
import { formatDistanceKm } from '@/lib/formatting/distances';
import { cn } from '@/lib/utils';
import { Truck } from 'lucide-react';

interface TransportPoolSuggestionProps {
  suggestion: TransportSuggestion;
  className?: string;
}

export function TransportPoolSuggestion({
  suggestion,
  className,
}: TransportPoolSuggestionProps) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-morning-mist bg-warm-paper p-4',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-farm-green/10 text-farm-green">
          <Truck className="size-5" aria-hidden />
        </span>
        <div>
          <h3 className="font-heading font-semibold text-field-ink">
            {suggestion.transporterName}
          </h3>
          <p className="text-sm text-muted-text">{suggestion.vehicleType}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-text">
        {suggestion.notes ??
          `Estimated route ${formatDistanceKm(suggestion.distanceKm)}. Combining transport may reduce delivery costs.`}
      </p>
      <p className="mt-2 text-sm font-semibold tabular-nums text-field-ink">
        Estimated cost: {formatGhs(suggestion.estimatedCost)}
      </p>
    </article>
  );
}
