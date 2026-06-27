"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PWAUpdatePromptProps {
  className?: string;
}

export function PWAUpdatePrompt({ className }: PWAUpdatePromptProps) {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerUpdateListener = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(newWorker);
          }
        });
      });
    };

    navigator.serviceWorker.ready.then(registerUpdateListener);

    const onControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  if (!waitingWorker) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-between gap-3 border-b border-leaf-green/30 bg-leaf-green/10 px-4 py-3",
        className,
      )}
    >
      <p className="text-sm text-foreground">
        A new version of FarmLink is ready.
      </p>
      <Button
        size="sm"
        variant="farm"
        onClick={handleUpdate}
        className="shrink-0 gap-1.5"
      >
        <RefreshCw className="size-3.5" aria-hidden="true" />
        Update
      </Button>
    </div>
  );
}
