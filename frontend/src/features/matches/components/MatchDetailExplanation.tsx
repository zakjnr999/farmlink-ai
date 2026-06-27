import type { BuyerMatch } from '@/types/match';
import { formatDistanceKm } from '@/lib/formatting/distances';

interface MatchDetailExplanationProps {
  match: BuyerMatch;
}

export function MatchDetailExplanation({ match }: MatchDetailExplanationProps) {
  const parts = [
    match.preferredQuantity &&
      `Needs around ${match.preferredQuantity} ${match.preferredUnit ?? 'units'}`,
    match.distanceKm !== undefined && `located ${formatDistanceKm(match.distanceKm)} away`,
    match.region && `based in ${match.region}`,
  ].filter(Boolean);

  return (
    <p className="rounded-xl border border-morning-mist bg-field-cream px-4 py-3 text-sm text-muted-text">
      {parts.length > 0
        ? `This buyer ${parts.join(', ')}.`
        : 'Review buyer details carefully before accepting any offer.'}
    </p>
  );
}
