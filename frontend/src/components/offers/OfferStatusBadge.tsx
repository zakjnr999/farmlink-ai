import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type OfferStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "countered"
  | "expired"
  | "withdrawn";

const statusConfig: Record<
  OfferStatus,
  { label: string; variant: "default" | "secondary" | "harvest" | "clay" | "leaf" | "destructive" | "muted" | "outline" }
> = {
  pending: { label: "Pending", variant: "harvest" },
  accepted: { label: "Accepted", variant: "leaf" },
  declined: { label: "Declined", variant: "destructive" },
  countered: { label: "Countered", variant: "clay" },
  expired: { label: "Expired", variant: "muted" },
  withdrawn: { label: "Withdrawn", variant: "secondary" },
};

interface OfferStatusBadgeProps {
  status: OfferStatus;
  className?: string;
}

export function OfferStatusBadge({ status, className }: OfferStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
