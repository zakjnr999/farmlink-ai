import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type ListingStatus =
  | "draft"
  | "active"
  | "paused"
  | "sold_out"
  | "expired"
  | "pending_review";

const statusConfig: Record<
  ListingStatus,
  { label: string; variant: "default" | "secondary" | "harvest" | "clay" | "leaf" | "destructive" | "muted" | "outline" }
> = {
  draft: { label: "Draft", variant: "muted" },
  active: { label: "Active", variant: "leaf" },
  paused: { label: "Paused", variant: "clay" },
  sold_out: { label: "Sold out", variant: "secondary" },
  expired: { label: "Expired", variant: "destructive" },
  pending_review: { label: "Pending review", variant: "harvest" },
};

interface ListingStatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export function ListingStatusBadge({
  status,
  className,
}: ListingStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
