import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface MatchScoreStripProps {
  score: number;
  label?: string;
  className?: string;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent match";
  if (score >= 75) return "Strong match";
  if (score >= 50) return "Good match";
  return "Partial match";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-farm-green";
  if (score >= 75) return "text-leaf-green";
  if (score >= 50) return "text-harvest-gold";
  return "text-clay-orange";
}

export function MatchScoreStrip({
  score,
  label,
  className,
}: MatchScoreStripProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const displayLabel = label ?? getScoreLabel(clampedScore);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{displayLabel}</span>
        <span
          className={cn(
            "font-heading font-semibold tabular-nums",
            getScoreColor(clampedScore),
          )}
        >
          {clampedScore}%
        </span>
      </div>
      <Progress value={clampedScore} aria-label={`Match score ${clampedScore} percent`} />
    </div>
  );
}
