'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  Handshake,
  LayoutDashboard,
  Search,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BUYER_ROUTES } from '@/constants/routes';

const items = [
  { href: BUYER_ROUTES.home, label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: BUYER_ROUTES.marketplace, label: 'Discover', icon: Search },
  { href: BUYER_ROUTES.recommendations, label: 'Recommendations', icon: Sparkles },
  { href: BUYER_ROUTES.demands, label: 'Demands', icon: ClipboardList },
  { href: BUYER_ROUTES.offers, label: 'Offers', icon: Handshake },
  { href: BUYER_ROUTES.pickups, label: 'Pickups', icon: CalendarDays },
  { href: BUYER_ROUTES.insights, label: 'Insights', icon: BarChart3 },
  { href: BUYER_ROUTES.notifications, label: 'Alerts', icon: Bell },
];

export function BuyerBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile buyer navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-soft-border bg-warm-paper/95 backdrop-blur-sm lg:hidden dark:bg-exchange-ink/95"
    >
      <ul className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[var(--touch-target)] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[0.65rem] font-medium',
                  active ? 'text-market-green' : 'text-ledger-grey',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
