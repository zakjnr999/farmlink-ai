import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type TransactionStatus =
  | "pending"
  | "confirmed"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed";

const statusConfig: Record<
  TransactionStatus,
  { label: string; variant: "default" | "secondary" | "harvest" | "clay" | "leaf" | "destructive" | "muted" | "outline" }
> = {
  pending: { label: "Pending", variant: "harvest" },
  confirmed: { label: "Confirmed", variant: "leaf" },
  in_transit: { label: "In transit", variant: "clay" },
  delivered: { label: "Delivered", variant: "default" },
  completed: { label: "Completed", variant: "leaf" },
  cancelled: { label: "Cancelled", variant: "muted" },
  disputed: { label: "Disputed", variant: "destructive" },
};

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

export function TransactionStatusBadge({
  status,
  className,
}: TransactionStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
