'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  Handshake,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  ShoppingBasket,
  Sparkles,
  User,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BUYER_ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  keywords: string;
  href?: string;
  action?: () => void;
  group: 'Pages' | 'Quick actions';
  icon: typeof LayoutDashboard;
}

interface BuyerCommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BuyerCommandPalette({ open: controlledOpen, onOpenChange }: BuyerCommandPaletteProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      router.push(href);
    },
    [router, setOpen],
  );

  const items: CommandItem[] = useMemo(
    () => [
      { id: 'home', label: 'Overview', keywords: 'dashboard supply desk home', href: BUYER_ROUTES.home, group: 'Pages', icon: LayoutDashboard },
      { id: 'marketplace', label: 'Discover produce', keywords: 'marketplace browse search listings', href: BUYER_ROUTES.marketplace, group: 'Pages', icon: Search },
      { id: 'recommendations', label: 'Recommendations', keywords: 'matches ranked supply', href: BUYER_ROUTES.recommendations, group: 'Pages', icon: Sparkles },
      { id: 'demands', label: 'My demands', keywords: 'demand requirements procurement', href: BUYER_ROUTES.demands, group: 'Pages', icon: ClipboardList },
      { id: 'offers', label: 'Offers', keywords: 'pending sent farmer', href: BUYER_ROUTES.offers, group: 'Pages', icon: Handshake },
      { id: 'transactions', label: 'Transactions', keywords: 'purchases confirmed', href: BUYER_ROUTES.transactions, group: 'Pages', icon: ShoppingBasket },
      { id: 'pickups', label: 'Pickup schedule', keywords: 'collection delivery calendar', href: BUYER_ROUTES.pickups, group: 'Pages', icon: CalendarDays },
      { id: 'insights', label: 'Supply insights', keywords: 'analytics charts reports', href: BUYER_ROUTES.insights, group: 'Pages', icon: BarChart3 },
      { id: 'notifications', label: 'Notifications', keywords: 'alerts updates', href: BUYER_ROUTES.notifications, group: 'Pages', icon: Bell },
      { id: 'profile', label: 'Business profile', keywords: 'account business identity', href: BUYER_ROUTES.profile, group: 'Pages', icon: User },
      { id: 'settings', label: 'Settings', keywords: 'preferences theme appearance', href: BUYER_ROUTES.settings, group: 'Pages', icon: Settings },
      {
        id: 'create-demand',
        label: 'Create new demand',
        keywords: 'add post requirement produce',
        href: BUYER_ROUTES.demandNew,
        group: 'Quick actions',
        icon: Plus,
      },
      {
        id: 'browse-marketplace',
        label: 'Browse marketplace',
        keywords: 'find farmers listings',
        href: BUYER_ROUTES.marketplace,
        group: 'Quick actions',
        icon: Search,
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        item.keywords.toLowerCase().includes(term),
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const pages = filtered.filter((i) => i.group === 'Pages');
    const actions = filtered.filter((i) => i.group === 'Quick actions');
    return { pages, actions };
  }, [filtered]);

  const flatFiltered = useMemo(
    () => [...grouped.pages, ...grouped.actions],
    [grouped],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setOpen]);

  const runItem = (item: CommandItem) => {
    if (item.href) navigate(item.href);
    else item.action?.();
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && flatFiltered[activeIndex]) {
      event.preventDefault();
      runItem(flatFiltered[activeIndex]);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-soft-border px-4 py-3">
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <DialogDescription className="sr-only">
            Search pages and quick actions. Press Ctrl+K to open.
          </DialogDescription>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ledger-grey" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search pages and actions…"
              className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
              autoFocus
              aria-label="Search command palette"
            />
          </div>
          <p className="text-xs text-ledger-grey">
            <kbd className="rounded border border-soft-border px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>
            {' + '}
            <kbd className="rounded border border-soft-border px-1.5 py-0.5 font-mono text-[10px]">K</kbd>
          </p>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto p-2">
          {flatFiltered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-ledger-grey">No matching pages or actions.</p>
          ) : (
            <>
              {grouped.pages.length > 0 && (
                <CommandGroup
                  label="Pages"
                  items={grouped.pages}
                  flatFiltered={flatFiltered}
                  activeIndex={activeIndex}
                  onSelect={runItem}
                />
              )}
              {grouped.actions.length > 0 && (
                <CommandGroup
                  label="Quick actions"
                  items={grouped.actions}
                  flatFiltered={flatFiltered}
                  activeIndex={activeIndex}
                  onSelect={runItem}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CommandGroup({
  label,
  items,
  flatFiltered,
  activeIndex,
  onSelect,
}: {
  label: string;
  items: CommandItem[];
  flatFiltered: CommandItem[];
  activeIndex: number;
  onSelect: (item: CommandItem) => void;
}) {
  return (
    <div className="mb-2">
      <p className="exchange-label px-2 py-1.5">{label}</p>
      <ul>
        {items.map((item) => {
          const Icon = item.icon;
          const index = flatFiltered.indexOf(item);
          const isActive = index === activeIndex;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-market-green/10 text-market-green'
                    : 'hover:bg-produce-cream/60 dark:hover:bg-deep-grove/40',
                )}
                onClick={() => onSelect(item)}
                onMouseEnter={() => {
                  /* hover handled via activeIndex from parent keyboard nav only */
                }}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
