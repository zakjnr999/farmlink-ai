import {
  Apple,
  Carrot,
  Cherry,
  Citrus,
  Grape,
  Leaf,
  Wheat,
} from "lucide-react";

import { cn } from "@/lib/utils";

type ProduceCategory =
  | "vegetable"
  | "fruit"
  | "grain"
  | "leafy"
  | "root"
  | "berry"
  | "citrus"
  | "other";

interface ProduceMarkerProps {
  category?: ProduceCategory;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const categoryConfig: Record<
  ProduceCategory,
  { icon: typeof Leaf; bg: string; fg: string }
> = {
  vegetable: { icon: Carrot, bg: "bg-clay-orange/15", fg: "text-clay-orange" },
  fruit: { icon: Apple, bg: "bg-tomato-red/15", fg: "text-tomato-red" },
  grain: { icon: Wheat, bg: "bg-harvest-gold/20", fg: "text-harvest-gold" },
  leafy: { icon: Leaf, bg: "bg-young-leaf/25", fg: "text-farm-green" },
  root: { icon: Carrot, bg: "bg-deep-soil/10", fg: "text-deep-soil dark:text-field-cream" },
  berry: { icon: Cherry, bg: "bg-tomato-red/10", fg: "text-tomato-red" },
  citrus: { icon: Citrus, bg: "bg-harvest-gold/15", fg: "text-clay-orange" },
  other: { icon: Grape, bg: "bg-morning-mist", fg: "text-muted-foreground" },
};

const sizeMap = {
  sm: { container: "size-8", icon: "size-4", text: "text-xs" },
  md: { container: "size-10", icon: "size-5", text: "text-sm" },
  lg: { container: "size-14", icon: "size-7", text: "text-base" },
};

export function ProduceMarker({
  category = "other",
  label,
  className,
  size = "md",
}: ProduceMarkerProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const sizes = sizeMap[size];

  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      title={label}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg",
          sizes.container,
          config.bg,
          config.fg,
        )}
        aria-hidden={!!label}
      >
        <Icon className={sizes.icon} />
      </span>
      {label && (
        <span className={cn("font-medium text-foreground", sizes.text)}>
          {label}
        </span>
      )}
    </div>
  );
}

export type { ProduceCategory };
