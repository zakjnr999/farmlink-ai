import { format, parseISO } from "date-fns";
import { CalendarDays, Sprout } from "lucide-react";

import { cn } from "@/lib/utils";

interface HarvestTimelineProps {
  plantedDate?: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  className?: string;
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function HarvestTimeline({
  plantedDate,
  expectedHarvestDate,
  actualHarvestDate,
  className,
}: HarvestTimelineProps) {
  const steps = [
    plantedDate && {
      label: "Planted",
      date: plantedDate,
      icon: Sprout,
      active: true,
    },
    expectedHarvestDate && {
      label: "Expected harvest",
      date: expectedHarvestDate,
      icon: CalendarDays,
      active: !actualHarvestDate,
    },
    actualHarvestDate && {
      label: "Harvested",
      date: actualHarvestDate,
      icon: CalendarDays,
      active: true,
    },
  ].filter(Boolean) as Array<{
    label: string;
    date: string;
    icon: typeof Sprout;
    active: boolean;
  }>;

  if (steps.length === 0) return null;

  return (
    <ol
      className={cn("relative space-y-0", className)}
      aria-label="Harvest timeline"
    >
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.label} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5 bg-border"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                step.active
                  ? "border-farm-green bg-farm-green/10 text-farm-green"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <time
                dateTime={step.date}
                className="text-xs text-muted-foreground"
              >
                {formatDate(step.date)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
