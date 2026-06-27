import { CloudOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface OfflineDraftBadgeProps {
  className?: string;
  label?: string;
}

export function OfflineDraftBadge({
  className,
  label = "Offline draft",
}: OfflineDraftBadgeProps) {
  return (
    <Badge
      variant="clay"
      className={cn("gap-1.5", className)}
    >
      <CloudOff className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}
