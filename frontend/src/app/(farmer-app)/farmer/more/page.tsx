'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Bell,
  ChevronRight,
  HelpCircle,
  MapPin,
  Settings,
  Sparkles,
  Truck,
  User,
} from 'lucide-react';

const links = [
  { href: '/farmer/advisory', label: 'Farm Advisor (AI)', icon: Sparkles },
  { href: '/farmer/profile', label: 'Farm profile', icon: User },
  { href: '/farmer/pickups', label: 'Pickups', icon: MapPin },
  { href: '/farmer/transport-suggestions', label: 'Transport pooling', icon: Truck },
  { href: '/farmer/notifications', label: 'Notifications', icon: Bell },
  { href: '/farmer/settings', label: 'Settings', icon: Settings },
  { href: '/farmer/help', label: 'Help & guidance', icon: HelpCircle },
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <PageHeader title="More" subtitle="Profile, settings and support" />
      <nav aria-label="More menu" className="mt-6 divide-y divide-morning-mist rounded-2xl border border-morning-mist bg-warm-paper">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-14 items-center justify-between px-4 py-3 text-base font-medium text-field-ink hover:bg-field-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-farm-green"
          >
            <span className="flex items-center gap-3">
              <Icon className="size-5 text-farm-green" aria-hidden />
              {label}
            </span>
            <ChevronRight className="size-5 text-muted-text" aria-hidden />
          </Link>
        ))}
      </nav>
    </div>
  );
}
