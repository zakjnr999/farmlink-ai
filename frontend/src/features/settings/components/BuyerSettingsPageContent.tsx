'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePwaInstall } from '@/hooks/use-pwa-install';

const BUYER_PREFS_KEY = 'farmlink-buyer-local-preferences';

interface BuyerLocalPreferences {
  compactNav: boolean;
  defaultMarketplaceSort: string;
}

const DEFAULT_PREFS: BuyerLocalPreferences = {
  compactNav: false,
  defaultMarketplaceSort: 'match_score',
};

function readPrefs(): BuyerLocalPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(BUYER_PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(prefs: BuyerLocalPreferences) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BUYER_PREFS_KEY, JSON.stringify(prefs));
}

function DeviceBadge() {
  return (
    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
      Stored on this device
    </Badge>
  );
}

export function BuyerSettingsPageContent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isInstallable, promptInstall } = usePwaInstall();
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<BuyerLocalPreferences>(DEFAULT_PREFS);
  const [showClear, setShowClear] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPrefs(readPrefs());
  }, []);

  const updatePrefs = (patch: Partial<BuyerLocalPreferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    writePrefs(next);
  };

  const handleClearData = () => {
    localStorage.removeItem(BUYER_PREFS_KEY);
    localStorage.removeItem('farmlink-buyer-onboarding-progress');
    setPrefs(DEFAULT_PREFS);
    toast.success('Local buyer preferences cleared from this device');
    setShowClear(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-5 pb-8 lg:px-8">
      <PageHeader
        title="Settings"
        subtitle="Appearance and device preferences for your procurement desk"
      />

      <section className="rounded-2xl border border-soft-border bg-warm-paper p-5 dark:bg-deep-grove/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading font-semibold">Appearance</h2>
            <p className="mt-1 text-sm text-ledger-grey">Theme for Harvest Exchange</p>
          </div>
          <DeviceBadge />
        </div>
        {mounted && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <Label htmlFor="buyer-theme">Dark mode</Label>
            <Switch
              id="buyer-theme"
              checked={resolvedTheme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        )}
        {mounted && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="buyer-theme-select">Theme preference</Label>
            <Select value={theme ?? 'system'} onValueChange={setTheme}>
              <SelectTrigger id="buyer-theme-select" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-soft-border bg-warm-paper p-5 dark:bg-deep-grove/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading font-semibold">Local preferences</h2>
            <p className="mt-1 text-sm text-ledger-grey">Saved only on this browser</p>
          </div>
          <DeviceBadge />
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="compact-nav">Compact navigation labels</Label>
            <Switch
              id="compact-nav"
              checked={prefs.compactNav}
              onCheckedChange={(checked) => updatePrefs({ compactNav: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marketplace-sort">Default marketplace sort</Label>
            <Select
              value={prefs.defaultMarketplaceSort}
              onValueChange={(value) => updatePrefs({ defaultMarketplaceSort: value })}
            >
              <SelectTrigger id="marketplace-sort" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match_score">Best match</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
                <SelectItem value="price_asc">Lowest price</SelectItem>
                <SelectItem value="newest">Newest listings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-soft-border bg-warm-paper p-5 opacity-75 dark:bg-deep-grove/20">
        <h2 className="font-heading font-semibold">Notification preferences</h2>
        <p className="mt-2 text-sm text-ledger-grey">
          Email and SMS alerts require backend integration and will be available in a future update.
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="email-alerts">Email alerts</Label>
            <Switch id="email-alerts" disabled />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="sms-alerts">SMS alerts</Label>
            <Switch id="sms-alerts" disabled />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-soft-border bg-warm-paper p-5 dark:bg-deep-grove/20">
        <h2 className="font-heading font-semibold">Install application</h2>
        <p className="mt-2 text-sm text-ledger-grey">
          Add FarmLink Buyer to your home screen for quick procurement access.
        </p>
        {isInstallable && (
          <Button className="mt-4 bg-market-green hover:bg-market-green/90" onClick={() => promptInstall()}>
            Install FarmLink
          </Button>
        )}
      </section>

      <section className="rounded-2xl border border-soft-border bg-warm-paper p-5 dark:bg-deep-grove/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading font-semibold">Clear local data</h2>
            <p className="mt-2 text-sm text-ledger-grey">
              Removes buyer onboarding progress and device preferences from this browser.
            </p>
          </div>
          <DeviceBadge />
        </div>
        <Button variant="destructive" className="mt-4" onClick={() => setShowClear(true)}>
          Clear local data
        </Button>
      </section>

      <AlertDialog open={showClear} onOpenChange={setShowClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear local buyer data?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes saved onboarding progress and local preferences from this device only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData}>Clear data</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
