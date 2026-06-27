'use client';

import { FlaskConical, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { config } from '@/lib/config';

interface DemoModeIndicatorProps {
  className?: string;
}

export function DemoModeIndicator({ className }: DemoModeIndicatorProps) {
  if (config.isDemoMode) {
    return (
      <Badge
        variant="harvest"
        className={cn('fixed right-3 top-3 z-50 gap-1.5 px-3 py-1 text-xs font-medium', className)}
      >
        <FlaskConical className="size-3" aria-hidden="true" />
        Demo mode — any valid email/phone + 6+ char password works
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'fixed right-3 top-3 z-50 max-w-xs gap-1.5 px-3 py-1 text-xs font-normal',
        className,
      )}
    >
      <Server className="size-3 shrink-0" aria-hidden="true" />
      Live API — backend required at {config.apiUrl}
    </Badge>
  );
}
