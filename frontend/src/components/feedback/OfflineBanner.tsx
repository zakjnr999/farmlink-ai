"use client";

import { WifiOff } from "lucide-react";

import { cn } from "@/lib/utils";

interface OfflineBannerProps {
  className?: string;
  message?: string;
}

export function OfflineBanner({
  className,
  message = "You're offline. Changes will sync when you're back online.",
}: OfflineBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-3 border-b border-clay-orange/30 bg-clay-orange/10 px-4 py-3 text-sm text-deep-soil dark:text-field-cream",
        className,
      )}
    >
      <WifiOff className="size-4 shrink-0 text-clay-orange" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
