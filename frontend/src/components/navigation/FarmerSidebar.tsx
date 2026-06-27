"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  List,
  Handshake,
  Settings,
  HelpCircle,
  Plus,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { FarmerPortalMark } from "@/components/brand/FarmerPortalMark";
import { PrimaryFarmAction } from "@/components/navigation/PrimaryFarmAction";
import { Separator } from "@/components/ui/separator";
import { PortalSwitcher } from '@/features/auth/components/PortalSwitcher';

const mainNav: Array<{
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
}> = [
  { href: "/farmer", label: "Home", icon: Home, exact: true },
  { href: "/farmer/listings", label: "Listings", icon: List },
  { href: "/farmer/offers", label: "Offers", icon: Handshake },
  { href: "/farmer/advisory", label: "Farm Advisor", icon: Sparkles },
];

const secondaryNav = [
  { href: "/farmer/settings", label: "Settings", icon: Settings },
  { href: "/farmer/help", label: "Help", icon: HelpCircle },
] as const;

export function FarmerSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden h-full w-64 flex-col border-r border-border bg-field-cream/40 dark:bg-deep-soil/20 md:flex">
      <div className="p-5">
        <FarmerPortalMark />
      </div>

      <div className="px-4 pb-4">
        <PrimaryFarmAction
          href="/farmer/list-produce"
          label="List Produce"
          icon={Plus}
        />
      </div>

      <Separator />

      <nav aria-label="Main navigation" className="flex-1 space-y-1 p-3">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[var(--touch-target)] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-farm-green/10 text-farm-green dark:bg-leaf-green/15 dark:text-leaf-green"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-3">
        <PortalSwitcher target="buyer" />
      </div>

      <nav aria-label="Secondary navigation" className="space-y-1 p-3">
        {secondaryNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
