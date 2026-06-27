import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  perUnit?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showFrom?: boolean;
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl font-bold",
};

export function PriceDisplay({
  amount,
  currency = "USD",
  perUnit,
  className,
  size = "md",
  showFrom = false,
}: PriceDisplayProps) {
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-body tabular-nums",
        sizeClasses[size],
        className,
      )}
    >
      {showFrom && (
        <span className="text-xs font-normal text-muted-foreground">from</span>
      )}
      <span className="font-heading text-farm-green dark:text-leaf-green">
        {formatted}
      </span>
      {perUnit && (
        <span className="text-sm font-normal text-muted-foreground">
          / {perUnit}
        </span>
      )}
    </span>
  );
}
