import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface PrimaryFarmActionProps {
  href: string;
  label: string;
  icon: LucideIcon;
  className?: string;
}

export function PrimaryFarmAction({
  href,
  label,
  icon: Icon,
  className,
}: PrimaryFarmActionProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-[var(--touch-target)] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-leaf-green to-farm-green px-4 py-3 font-heading text-sm font-semibold text-warm-paper shadow-md transition-opacity hover:opacity-95 active:opacity-90",
        className,
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      {label}
    </Link>
  );
}
