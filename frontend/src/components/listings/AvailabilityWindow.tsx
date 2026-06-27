import { format, parseISO } from "date-fns";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

interface AvailabilityWindowProps {
  startDate: string;
  endDate: string;
  className?: string;
}

function formatRange(start: string, end: string) {
  try {
    const startFormatted = format(parseISO(start), "MMM d");
    const endFormatted = format(parseISO(end), "MMM d, yyyy");
    return `${startFormatted} – ${endFormatted}`;
  } catch {
    return `${start} – ${end}`;
  }
}

export function AvailabilityWindow({
  startDate,
  endDate,
  className,
}: AvailabilityWindowProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-morning-mist/60 px-3 py-2 text-sm dark:bg-muted",
        className,
      )}
    >
      <Clock className="size-4 shrink-0 text-farm-green" aria-hidden="true" />
      <span>
        <span className="sr-only">Available </span>
        <time dateTime={startDate}>{formatRange(startDate, endDate)}</time>
      </span>
    </div>
  );
}
