import { apiGet, apiPost } from './client';
import type { Notification } from '@/types/notification';

export async function getNotifications(): Promise<Notification[]> {
  const response = await apiGet<Notification[]>('/notifications');
  return response.data;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const response = await apiPost<Notification>(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsRead(): Promise<Notification[]> {
  const response = await apiPost<Notification[]>('/notifications/read-all');
  return response.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const notifications = await getNotifications();
  return notifications.filter((n) => !n.read).length;
}
