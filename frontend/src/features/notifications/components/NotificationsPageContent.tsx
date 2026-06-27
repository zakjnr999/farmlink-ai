'use client';

import Link from 'next/link';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { formatRelativeDate } from '@/lib/formatting/dates';

export function NotificationsPageContent() {
  const { notifications, isLoading, isError, refetch, markRead, markAllRead } =
    useNotifications();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <ErrorState title="Could not load notifications" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <PageHeader
        title="Notifications"
        subtitle="Updates about matches, offers and pickups"
        actions={
          notifications.some((n) => !n.read) ? (
            <Button variant="outline" size="sm" onClick={() => markAllRead()}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No notifications yet"
          description="FarmLink will notify you when buyers match your listings or send offers."
        />
      ) : (
        <ul className="mt-6 divide-y divide-morning-mist rounded-2xl border border-morning-mist bg-warm-paper">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <Link
                href={notification.actionUrl ?? '/farmer/notifications'}
                onClick={() => !notification.read && markRead(notification.id)}
                className="block px-4 py-4 hover:bg-field-cream"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-field-ink">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-text">{notification.body}</p>
                    <p className="mt-2 text-xs text-muted-text">
                      {formatRelativeDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-farm-green" aria-label="Unread" />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
