import { Building2, MapPin, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { MatchScoreStrip } from "@/components/offers/MatchScoreStrip";

interface BuyerMatchSummaryProps {
  buyerName: string;
  location?: string;
  buyerType?: string;
  rating?: number;
  matchScore: number;
  highlights?: string[];
  className?: string;
}

export function BuyerMatchSummary({
  buyerName,
  location,
  buyerType,
  rating,
  matchScore,
  highlights = [],
  className,
}: BuyerMatchSummaryProps) {
  return (
    <article
      className={cn(
        "field-journal-card space-y-4 p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <h3 className="truncate font-heading font-semibold text-foreground">
              {buyerName}
            </h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {buyerType && <span>{buyerType}</span>}
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden="true" />
                {location}
              </span>
            )}
            {rating !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Star
                  className="size-3 fill-harvest-gold text-harvest-gold"
                  aria-hidden="true"
                />
                {rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      <MatchScoreStrip score={matchScore} />

      {highlights.length > 0 && (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-leaf-green"
                aria-hidden="true"
              />
              {highlight}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
