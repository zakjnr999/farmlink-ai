'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Mic, PenLine, ClipboardList } from 'lucide-react';

const options = [
  {
    href: '/farmer/list-produce/voice',
    label: 'Speak',
    description: 'Describe your harvest out loud',
    icon: Mic,
    recommended: true,
  },
  {
    href: '/farmer/list-produce/text',
    label: 'Type',
    description: 'Write what you have available',
    icon: PenLine,
  },
  {
    href: '/farmer/list-produce/form',
    label: 'Fill form',
    description: 'Enter details step by step',
    icon: ClipboardList,
  },
];

export function ListProduceEntry() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <PageHeader
        title="List produce"
        subtitle="Choose how you want to tell FarmLink about your harvest."
      />
      <div className="mt-8 space-y-4">
        {options.map(({ href, label, description, icon: Icon, recommended }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-[4.5rem] items-center gap-4 rounded-2xl border border-morning-mist bg-warm-paper px-5 py-4 transition-colors hover:border-farm-green/40 hover:bg-field-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-farm-green"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-farm-green/10 text-farm-green">
              <Icon className="size-6" aria-hidden />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2 font-heading text-lg font-semibold text-field-ink">
                {label}
                {recommended && (
                  <span className="rounded-full bg-harvest-gold/20 px-2 py-0.5 text-xs font-medium text-deep-soil">
                    Recommended
                  </span>
                )}
              </span>
              <span className="mt-1 block text-sm text-muted-text">{description}</span>
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-text">
        You can review and edit all details before publishing. Nothing is listed until you confirm.
      </p>
    </div>
  );
}
