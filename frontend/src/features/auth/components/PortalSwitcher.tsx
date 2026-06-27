'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, ShoppingBasket, Sprout } from 'lucide-react';
import { BUYER_ROUTES, FARMER_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/use-auth';
import type { PortalRole } from '@/types/auth';
import { cn } from '@/lib/utils';

interface PortalSwitcherProps {
  target: PortalRole;
  className?: string;
}

const copy: Record<
  PortalRole,
  { label: string; addLabel: string; href: string; switchHref: string; icon: typeof Sprout }
> = {
  farmer: {
    label: 'Farmer portal',
    addLabel: 'Add farmer access',
    href: FARMER_ROUTES.signup,
    switchHref: FARMER_ROUTES.home,
    icon: Sprout,
  },
  buyer: {
    label: 'Buyer portal',
    addLabel: 'Add buyer access',
    href: BUYER_ROUTES.signup,
    switchHref: BUYER_ROUTES.home,
    icon: ShoppingBasket,
  },
};

export function PortalSwitcher({ target, className }: PortalSwitcherProps) {
  const { user, isFarmer, isBuyer, switchPortal } = useAuth();
  const router = useRouter();
  const meta = copy[target];
  const Icon = meta.icon;
  const hasTarget = target === 'farmer' ? isFarmer : isBuyer;

  if (!user) return null;

  if (!hasTarget) {
    return (
      <Link
        href={meta.href}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
          className,
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        {meta.addLabel}
      </Link>
    );
  }

  const otherHasRole = target === 'farmer' ? isBuyer : isFarmer;
  if (!otherHasRole) return null;

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className,
      )}
      onClick={async () => {
        await switchPortal(target);
        router.push(meta.switchHref);
      }}
    >
      <ArrowLeftRight className="size-4 shrink-0" aria-hidden />
      Switch to {meta.label}
    </button>
  );
}
