import type { Database } from '@/lib/database.types';

// Full backend enum. Some values (review_received, time_off_decided) are for
// partner/employee recipients and never reach a customer, but the type stays
// honest so `notificationVisual` has to cover or fall back for each of them.
export type NotificationType = Database['public']['Enums']['notification_type'];

// View model the screens render (developer-guide.md §5). Built from a
// `notifications` row by `toNotification`: `message` is the row's `body`,
// `store_id`/`booking_id` come out of the `data` jsonb, `is_read` is `read_at`.
export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  store_id: string | null;
  booking_id: string | null;
  is_read: boolean;
  created_at: string;
}
