import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationsApi';
import { notificationKeys } from '../api/queryKeys';

export function useNotifications(params?: { is_read?: boolean; limit?: number }) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
