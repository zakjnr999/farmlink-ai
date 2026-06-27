import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StickyActionBarProps {
  children: ReactNode;
  className?: string;
}

export function StickyActionBar({ children, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-40 -mx-4 border-t border-border bg-warm-paper/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-warm-paper/80 dark:bg-field-ink/95 dark:supports-[backdrop-filter]:bg-field-ink/80 sm:-mx-6 sm:px-6",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">{children}</div>
    </div>
  );
}
