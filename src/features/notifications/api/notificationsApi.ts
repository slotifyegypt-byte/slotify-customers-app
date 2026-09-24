import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import { notificationSchema, unreadCountSchema } from './schemas';

// customer-app-api-map.md §12
// Trailing slash is load-bearing: the backend 307-redirects the slash-less
// path, and that redirect's Location header is (buggily) `http://`, not
// `https://` — iOS/Android both block following it, so the bare path
// silently fails on-device. Calling the canonical slash-terminated path
// avoids the redirect entirely.
export async function getNotifications(params?: { is_read?: boolean; limit?: number }) {
  const response = await apiClient.get('/notifications/', { params });
  return validateResponse(z.array(notificationSchema), response, 'GET /notifications/');
}

// VERIFIED against the backend source (2026-09-18): `{unread_count: int}`
// for the customer-token endpoint below. There's a second, unrelated
// `/stores/{store_id}/notifications/unread-count` for employee tokens on the
// partner dashboard — not this app's concern.
export async function getUnreadNotificationCount() {
  const response = await apiClient.get('/notifications/unread-count');
  return validateResponse(unreadCountSchema, response, 'GET /notifications/unread-count');
}

export async function markAllNotificationsRead() {
  const response = await apiClient.put('/notifications/mark-all-read');
  return response.data as { marked_read?: number };
}

export async function deleteNotification(id: number) {
  await apiClient.delete(`/notifications/${id}`);
}
