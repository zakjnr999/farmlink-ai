import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}

const sizeMap = {
  sm: { icon: 28, text: "text-base" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 48, text: "text-2xl" },
};

export function BrandMark({
  className,
  size = "md",
  showWordmark = true,
}: BrandMarkProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="10"
          className="fill-farm-green"
        />
        <path
          d="M24 10C18 10 14 16 14 22C14 28 18 34 24 38C30 34 34 28 34 22C34 16 30 10 24 10Z"
          className="fill-young-leaf"
        />
        <path
          d="M24 14V34M18 20C20 18 22 17 24 17C26 17 28 18 30 20"
          stroke="#FCFAF4"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="22" r="2" fill="#D7A33E" />
      </svg>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-heading font-bold tracking-tight text-field-ink dark:text-field-cream",
              text,
            )}
          >
            FarmLink
          </span>
          <span className="text-[0.65em] font-medium uppercase tracking-widest text-muted-foreground">
            AI
          </span>
        </div>
      )}
    </div>
  );
}
