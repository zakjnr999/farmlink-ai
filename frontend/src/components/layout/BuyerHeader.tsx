'use client';

import Link from 'next/link';
import { Bell, LogOut, Search, Settings, User } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useAuth } from '@/hooks/use-auth';
import { BUYER_ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { useBuyerNavCounts } from '@/features/dashboard/hooks/use-buyer-nav-counts';

interface BuyerHeaderProps {
  title?: string;
  subtitle?: string;
  onOpenSearch?: () => void;
}

export function BuyerHeader({ title, subtitle, onOpenSearch }: BuyerHeaderProps) {
  const { buyerProfile, logout } = useAuth();
  const counts = useBuyerNavCounts();
  const accraNow = toZonedTime(new Date(), 'Africa/Accra');
  const dateLabel = format(accraNow, 'EEEE, d MMM yyyy');

  return (
    <header className="harvest-exchange-surface sticky top-0 z-30 px-4 py-4 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {title ? (
            <>
              <h1 className="font-heading truncate text-xl font-semibold text-exchange-ink dark:text-produce-cream sm:text-2xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-ledger-grey dark:text-muted-foreground">{subtitle}</p>
              )}
            </>
          ) : (
            <>
              <p className="exchange-label">{dateLabel}</p>
              <h1 className="font-heading mt-1 text-xl font-semibold text-exchange-ink dark:text-produce-cream sm:text-2xl">
                {buyerProfile?.businessName ?? 'Your procurement desk'}
              </h1>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onOpenSearch && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenSearch}
              aria-label="Open search"
              className="hidden sm:inline-flex"
            >
              <Search className="size-4" />
            </Button>
          )}
          <Button asChild variant="outline" size="icon" className="relative">
            <Link href={BUYER_ROUTES.notifications} aria-label="Notifications">
              <Bell className="size-4" />
              {counts.notifications > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-harvest-gold text-[10px] font-bold text-exchange-ink">
                  {counts.notifications}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link href={BUYER_ROUTES.profile} aria-label="Business profile">
              <User className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="hidden md:inline-flex">
            <Link href={BUYER_ROUTES.settings} aria-label="Settings">
              <Settings className="size-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Sign out"
            className="hidden md:inline-flex"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
