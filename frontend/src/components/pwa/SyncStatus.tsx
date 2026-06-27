"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type SyncState = "synced" | "syncing" | "offline" | "error";

interface SyncStatusProps {
  className?: string;
  pendingCount?: number;
}

export function SyncStatus({ className, pendingCount = 0 }: SyncStatusProps) {
  const [online, setOnline] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>("synced");

  useEffect(() => {
    setOnline(navigator.onLine);

    const handleOnline = () => {
      setOnline(true);
      if (pendingCount > 0) {
        setSyncState("syncing");
      } else {
        setSyncState("synced");
      }
    };
    const handleOffline = () => {
      setOnline(false);
      setSyncState("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pendingCount]);

  useEffect(() => {
    if (!online) {
      setSyncState("offline");
    } else if (pendingCount > 0) {
      setSyncState("syncing");
    } else {
      setSyncState("synced");
    }
  }, [online, pendingCount]);

  const config = {
    synced: {
      icon: Cloud,
      label: "All changes saved",
      className: "text-leaf-green",
    },
    syncing: {
      icon: Loader2,
      label:
        pendingCount > 0
          ? `Syncing ${pendingCount} change${pendingCount === 1 ? "" : "s"}…`
          : "Syncing…",
      className: "text-harvest-gold",
    },
    offline: {
      icon: CloudOff,
      label: "Offline — changes saved locally",
      className: "text-clay-orange",
    },
    error: {
      icon: CloudOff,
      label: "Sync failed — will retry",
      className: "text-tomato-red",
    },
  }[syncState];

  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon
        className={cn(
          "size-3.5",
          syncState === "syncing" && "animate-spin",
        )}
        aria-hidden="true"
      />
      {config.label}
    </div>
  );
}
