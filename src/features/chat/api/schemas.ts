import { z } from 'zod';

// customer-app-api-map.md §10 — sample payloads for
// GET/POST /bookings/{booking_id}/messages. `sender_type` is what bubble
// alignment/color keys off of; `sender_name` is display-only.
export const senderTypeSchema = z.enum(['customer', 'store']);
export type SenderType = z.infer<typeof senderTypeSchema>;

export const bookingMessageSchema = z.object({
  id: z.number(),
  booking_id: z.string(),
  sender_type: senderTypeSchema,
  sender_name: z.string(),
  message: z.string(),
  is_read: z.boolean(),
  created_at: z.string(),
});
export type BookingMessage = z.infer<typeof bookingMessageSchema>;

// PUT /bookings/{booking_id}/messages/read
export const markReadResponseSchema = z.object({
  marked_read: z.number(),
});

// GET /bookings/{booking_id}/messages/unread-count
export const unreadCountResponseSchema = z.object({
  booking_id: z.string(),
  unread_count: z.number(),
});
