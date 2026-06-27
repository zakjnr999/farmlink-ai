import { Sprout } from "lucide-react";

import { cn } from "@/lib/utils";

interface FarmerPortalMarkProps {
  className?: string;
  compact?: boolean;
}

export function FarmerPortalMark({
  className,
  compact = false,
}: FarmerPortalMarkProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-xl border border-border bg-field-cream/60 px-3 py-2 dark:bg-deep-soil/40",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-leaf-green to-farm-green text-warm-paper shadow-sm">
        <Sprout className="size-5" aria-hidden="true" />
      </div>
      {!compact && (
        <div className="flex flex-col">
          <span className="font-heading text-sm font-semibold leading-tight text-foreground">
            Farmer Portal
          </span>
          <span className="text-xs text-muted-foreground">
            Field journal & marketplace
          </span>
        </div>
      )}
      {compact && (
        <span className="sr-only">Farmer Portal</span>
      )}
    </div>
  );
}
