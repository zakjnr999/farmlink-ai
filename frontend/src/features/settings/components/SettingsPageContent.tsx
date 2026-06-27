'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { clearAllDrafts } from '@/lib/offline/draft-storage';
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
import { useState } from 'react';
import { toast } from 'sonner';

export function SettingsPageContent() {
  const { isInstallable, promptInstall } = usePwaInstall();
  const [showClear, setShowClear] = useState(false);

  const handleClearData = async () => {
    await clearAllDrafts();
    localStorage.removeItem('farmlink-onboarding-progress');
    toast.success('Local data cleared from this device');
    setShowClear(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-8">
      <PageHeader title="Settings" subtitle="Preferences stored on this device unless noted" />

      <div className="mt-6 space-y-4">
        <section className="rounded-2xl border border-morning-mist bg-warm-paper p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="dark-mode">Dark appearance</Label>
              <p className="text-sm text-muted-text">Stored on this device</p>
            </div>
            <Switch id="dark-mode" disabled aria-describedby="dark-mode-note" />
          </div>
          <p id="dark-mode-note" className="mt-2 text-xs text-muted-text">
            Full theme switching will be enabled in a future update.
          </p>
        </section>

        <section className="rounded-2xl border border-morning-mist bg-warm-paper p-5">
          <h2 className="font-heading font-semibold">Notification preferences</h2>
          <p className="mt-2 text-sm text-muted-text">Backend integration required</p>
        </section>

        <section className="rounded-2xl border border-morning-mist bg-warm-paper p-5">
          <h2 className="font-heading font-semibold">Install application</h2>
          <p className="mt-2 text-sm text-muted-text">
            Add FarmLink to your home screen for quick access in the field.
          </p>
          {isInstallable && (
            <Button className="mt-4" onClick={() => promptInstall()}>
              Install FarmLink
            </Button>
          )}
        </section>

        <section className="rounded-2xl border border-morning-mist bg-warm-paper p-5">
          <h2 className="font-heading font-semibold">Clear local data</h2>
          <p className="mt-2 text-sm text-muted-text">
            Removes offline drafts and onboarding progress from this device. Unsynced drafts may be lost.
          </p>
          <Button variant="destructive" className="mt-4" onClick={() => setShowClear(true)}>
            Clear local data
          </Button>
        </section>
      </div>

      <AlertDialog open={showClear} onOpenChange={setShowClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear local data?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes unsynced listing drafts and saved onboarding progress from this device.
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
