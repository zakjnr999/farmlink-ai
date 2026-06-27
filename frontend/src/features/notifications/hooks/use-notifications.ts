'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: notificationsApi.getNotifications,
  });

  const markRead = async (id: string) => {
    await notificationsApi.markNotificationRead(id);
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };

  const markAllRead = async () => {
    await notificationsApi.markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    markRead,
    markAllRead,
  };
}
