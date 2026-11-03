import { ApiError, fromPostgrest } from '@/lib/api/errors';
import { supabase } from '@/lib/supabase';

import { NOTIFICATION_COLUMNS, toNotification } from './mappers';
import type { Notification } from './schemas';

const DEFAULT_LIMIT = 50;

// developer-guide.md §5. RLS (`notifications_own_*`) scopes every statement to
// the signed-in customer, so no customer_id filter is sent (and filtering on it
// is not needed). `authenticated` can only UPDATE `read_at`.
export async function getNotifications(params?: {
  is_read?: boolean;
  limit?: number;
}): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select(NOTIFICATION_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(params?.limit ?? DEFAULT_LIMIT);
  if (params?.is_read === false) query = query.is('read_at', null);
  if (params?.is_read === true) query = query.not('read_at', 'is', null);
  const { data, error } = await query;
  if (error) throw fromPostgrest(error);
  return (data ?? []).map(toNotification);
}

export async function getUnreadNotificationCount(): Promise<{ unread_count: number }> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null);
  if (error) throw fromPostgrest(error);
  return { unread_count: count ?? 0 };
}

// A row RLS hides (or that no longer exists) updates zero rows without an
// error, so an empty result is surfaced as forbidden rather than silently
// passing.
export async function markNotificationRead(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .select('id');
  if (error) throw fromPostgrest(error);
  if (!data?.length) throw new ApiError('forbidden', 403, 'notification not updated');
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null);
  if (error) throw fromPostgrest(error);
}

// `notifications_own_delete` policy + table DELETE grant exist for customers.
export async function deleteNotification(id: string): Promise<void> {
  const { data, error } = await supabase.from('notifications').delete().eq('id', id).select('id');
  if (error) throw fromPostgrest(error);
  if (!data?.length) throw new ApiError('forbidden', 403, 'notification not deleted');
}
