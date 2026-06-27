'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notificationsApi } from '@/lib/api';
import { formatRelativeDate } from '@/lib/formatting/dates';
import { queryKeys } from '@/lib/query/keys';
import type { Notification, NotificationType } from '@/types/notification';

type NotificationCategory = 'all' | 'offers' | 'transactions' | 'pickups' | 'recommendations' | 'account';

const CATEGORY_TABS: Array<{ value: NotificationCategory; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'offers', label: 'Offers' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'pickups', label: 'Pickups' },
  { value: 'recommendations', label: 'Matches' },
  { value: 'account', label: 'Account' },
];

const OFFER_TYPES: NotificationType[] = [
  'offer_received',
  'offer_accepted',
  'offer_rejected',
  'offer',
];
const TRANSACTION_TYPES: NotificationType[] = ['transaction_update', 'transaction'];
const PICKUP_TYPES: NotificationType[] = ['pickup'];
const RECOMMENDATION_TYPES: NotificationType[] = ['match_found', 'recommendation'];
const ACCOUNT_TYPES: NotificationType[] = ['system', 'account', 'listing_expiring'];

function filterByCategory(notifications: Notification[], category: NotificationCategory) {
  if (category === 'all') return notifications;
  const typeMap: Record<Exclude<NotificationCategory, 'all'>, NotificationType[]> = {
    offers: OFFER_TYPES,
    transactions: TRANSACTION_TYPES,
    pickups: PICKUP_TYPES,
    recommendations: RECOMMENDATION_TYPES,
    account: ACCOUNT_TYPES,
  };
  const allowed = typeMap[category];
  return notifications.filter((n) => allowed.includes(n.type));
}

export function BuyerNotificationsPageContent() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<NotificationCategory>('all');

  const query = useQuery({
    queryKey: queryKeys.notifications.list({ audience: 'buyer' }),
    queryFn: notificationsApi.getNotifications,
  });

  const filtered = useMemo(
    () => filterByCategory(query.data ?? [], category),
    [query.data, category],
  );

  const unreadCount = (query.data ?? []).filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    await notificationsApi.markNotificationRead(id);
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };

  const markAllRead = async () => {
    await notificationsApi.markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8">
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8">
        <ErrorState title="Could not load notifications" onRetry={() => query.refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-8 lg:px-8">
      <PageHeader
        title="Notifications"
        subtitle="Updates about matches, offers and pickups"
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={() => void markAllRead()}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <Tabs value={category} onValueChange={(v) => setCategory(v as NotificationCategory)} className="mt-6">
        <TabsList className="w-full flex-wrap justify-start">
          {CATEGORY_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORY_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {filtered.length === 0 ? (
              <EmptyState
                title="No notifications in this category"
                description="FarmLink will notify you when farmers respond to offers or pickup dates change."
              />
            ) : (
              <ul className="divide-y divide-soft-border rounded-2xl border border-soft-border bg-warm-paper dark:bg-deep-grove/20">
                {filtered.map((notification) => (
                  <li key={notification.id}>
                    <NotificationRow
                      notification={notification}
                      onMarkRead={() => void markRead(notification.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => void;
}) {
  const categoryLabel = getCategoryLabel(notification.type);

  const content = (
    <div className="flex items-start justify-between gap-3 px-4 py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            {categoryLabel}
          </Badge>
          {!notification.read && (
            <span className="size-2 rounded-full bg-market-green" aria-label="Unread" />
          )}
        </div>
        <p className="mt-2 font-medium text-exchange-ink dark:text-produce-cream">
          {notification.title}
        </p>
        <p className="mt-1 text-sm text-ledger-grey">{notification.body}</p>
        <p className="mt-2 text-xs text-ledger-grey">
          {formatRelativeDate(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-market-green"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkRead();
          }}
        >
          Mark read
        </Button>
      )}
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link
        href={notification.actionUrl}
        onClick={() => !notification.read && onMarkRead()}
        className="block transition-colors hover:bg-produce-cream/50 dark:hover:bg-deep-grove/30"
      >
        {content}
      </Link>
    );
  }

  return content;
}

function getCategoryLabel(type: NotificationType): string {
  if (OFFER_TYPES.includes(type)) return 'Offer';
  if (TRANSACTION_TYPES.includes(type)) return 'Transaction';
  if (PICKUP_TYPES.includes(type)) return 'Pickup';
  if (RECOMMENDATION_TYPES.includes(type)) return 'Match';
  return 'Account';
}
