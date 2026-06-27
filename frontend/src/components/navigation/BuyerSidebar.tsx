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
  ShoppingBasket,
  Sparkles,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BuyerPortalMark } from '@/components/brand/BuyerPortalMark';
import { BUYER_ROUTES } from '@/constants/routes';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { PortalSwitcher } from '@/features/auth/components/PortalSwitcher';

interface BuyerSidebarProps {
  counts?: {
    recommendations?: number;
    offers?: number;
    pickups?: number;
    notifications?: number;
  };
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badgeKey?: keyof NonNullable<BuyerSidebarProps['counts']>;
}

const procurementNav: NavItem[] = [
  { href: BUYER_ROUTES.home, label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: BUYER_ROUTES.marketplace, label: 'Discover Produce', icon: Search },
  { href: BUYER_ROUTES.recommendations, label: 'Recommendations', icon: Sparkles, badgeKey: 'recommendations' },
  { href: BUYER_ROUTES.demands, label: 'My Demands', icon: ClipboardList },
];

const commercialNav: NavItem[] = [
  { href: BUYER_ROUTES.offers, label: 'Offers', icon: Handshake, badgeKey: 'offers' },
  { href: BUYER_ROUTES.transactions, label: 'Transactions', icon: ShoppingBasket },
];

const planningNav: NavItem[] = [
  { href: BUYER_ROUTES.pickups, label: 'Pickup Schedule', icon: CalendarDays, badgeKey: 'pickups' },
  { href: BUYER_ROUTES.insights, label: 'Supply Insights', icon: BarChart3 },
];

const accountNav: NavItem[] = [
  { href: BUYER_ROUTES.notifications, label: 'Notifications', icon: Bell, badgeKey: 'notifications' },
  { href: BUYER_ROUTES.profile, label: 'Business Profile', icon: User },
];

function NavSection({
  title,
  items,
  pathname,
  collapsed,
  counts,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  counts?: BuyerSidebarProps['counts'];
}) {
  return (
    <div className="space-y-1">
      {!collapsed && <p className="exchange-label px-3 pb-1 pt-3">{title}</p>}
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const badge = item.badgeKey && counts ? counts[item.badgeKey] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              'relative flex min-h-[var(--touch-target)] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-market-green/10 text-market-green dark:bg-fresh-leaf/15 dark:text-fresh-leaf'
                : 'text-ledger-grey hover:bg-cool-mist/60 hover:text-exchange-ink dark:hover:bg-deep-grove/40',
              collapsed && 'justify-center px-2',
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && badge ? (
              <span className="ml-auto rounded-full bg-harvest-gold/20 px-2 py-0.5 text-xs font-semibold tabular-nums text-deep-grove">
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

export function BuyerSidebar({ counts }: BuyerSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden h-dvh shrink-0 flex-col border-r border-soft-border bg-produce-cream/80 transition-[width] duration-200 lg:flex dark:border-soft-border/20 dark:bg-exchange-ink',
        collapsed ? 'w-[5.25rem]' : 'w-[16.25rem]',
      )}
    >
      <div className={cn('p-4', collapsed && 'px-2')}>
        <BuyerPortalMark compact={collapsed} />
      </div>
      <Separator />
      <nav aria-label="Buyer navigation" className="flex-1 overflow-y-auto p-2">
        <NavSection title="Procurement" items={procurementNav} pathname={pathname} collapsed={collapsed} counts={counts} />
        <NavSection title="Commercial Activity" items={commercialNav} pathname={pathname} collapsed={collapsed} counts={counts} />
        <NavSection title="Planning" items={planningNav} pathname={pathname} collapsed={collapsed} counts={counts} />
        <NavSection title="Account" items={accountNav} pathname={pathname} collapsed={collapsed} counts={counts} />
      </nav>
      <div className="space-y-2 border-t border-soft-border p-2 dark:border-soft-border/20">
        <PortalSwitcher target="farmer" className={collapsed ? 'justify-center px-0' : undefined} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>
    </aside>
  );
}
