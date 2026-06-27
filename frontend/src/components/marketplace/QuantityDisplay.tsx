import { cn } from "@/lib/utils";

interface QuantityDisplayProps {
  amount: number;
  unit: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl font-semibold",
};

export function QuantityDisplay({
  amount,
  unit,
  className,
  size = "md",
}: QuantityDisplayProps) {
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-body tabular-nums text-foreground",
        sizeClasses[size],
        className,
      )}
    >
      <span className="font-medium">{formatted}</span>
      <span className="text-muted-foreground">{unit}</span>
    </span>
  );
}
