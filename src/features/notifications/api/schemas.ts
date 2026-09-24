import { z } from 'zod';

// customer-app-api-map.md §12 — VERIFIED against the live backend's
// /openapi.json (2026-09-20): `NotificationRead` now carries a real
// `notification_type` enum plus optional `store_id`/`booking_id` reference
// fields. Notifications are now actually triggered by real backend events
// (booking confirmed/cancelled, pickup-ready for drop-off orders), replacing
// the old gap where the doc noted there was no type/reference field to
// deep-link or categorize on at all.
export const notificationTypeSchema = z.enum([
  'booking_confirmed',
  'booking_cancelled',
  'pickup_ready',
  'general',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
  id: z.number(),
  customer_id: z.string(),
  title: z.string(),
  message: z.string(),
  notification_type: notificationTypeSchema,
  store_id: z.string().nullable().optional(),
  booking_id: z.string().nullable().optional(),
  is_read: z.boolean(),
  created_at: z.string(),
});
export type Notification = z.infer<typeof notificationSchema>;

export const unreadCountSchema = z.object({
  unread_count: z.number(),
});
