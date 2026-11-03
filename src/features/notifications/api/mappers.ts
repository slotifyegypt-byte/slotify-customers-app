import type { Database } from '@/lib/database.types';

import type { Notification } from './schemas';

// The columns `authenticated` may SELECT that the app needs (customer_id,
// employee_id and pushed_at are granted too but unused).
export const NOTIFICATION_COLUMNS = 'id, type, title, body, data, read_at, created_at';

export type NotificationRow = Pick<
  Database['public']['Tables']['notifications']['Row'],
  'id' | 'type' | 'title' | 'body' | 'data' | 'read_at' | 'created_at'
>;

// `data` is free-form jsonb written by backend triggers; read ids defensively.
function stringField(data: unknown, key: string): string | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
  const value = (data as Record<string, unknown>)[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

// Shared by REST rows and Realtime payloads.
export function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.body ?? '',
    notification_type: row.type,
    store_id: stringField(row.data, 'branch_id'),
    booking_id: stringField(row.data, 'booking_id'),
    is_read: row.read_at !== null,
    created_at: row.created_at,
  };
}
