"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  List,
  Handshake,
  Menu,
  Plus,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  prominent?: boolean;
}> = [
  { href: "/farmer", label: "Home", icon: Home },
  { href: "/farmer/listings", label: "Listings", icon: List },
  { href: "/farmer/list-produce", label: "List Produce", icon: Plus, prominent: true },
  { href: "/farmer/offers", label: "Offers", icon: Handshake },
  { href: "/farmer/more", label: "More", icon: Menu },
];

export function FarmerBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Farmer navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-warm-paper/95 backdrop-blur-sm supports-[backdrop-filter]:bg-warm-paper/85 dark:bg-field-ink/95 dark:supports-[backdrop-filter]:bg-field-ink/85 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-end justify-around px-2 pt-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/farmer"
              ? pathname === "/farmer"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.prominent) {
            return (
              <li key={item.href} className="relative -mt-5">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      "flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-leaf-green to-farm-green text-warm-paper shadow-lg ring-4 ring-warm-paper dark:ring-field-ink",
                      isActive && "ring-harvest-gold/40",
                    )}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-[0.65rem] font-semibold text-farm-green">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-[var(--touch-target)] min-w-[var(--touch-target)] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-[0.65rem] font-medium transition-colors",
                  isActive
                    ? "text-farm-green"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("size-5", isActive && "stroke-[2.5]")}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
