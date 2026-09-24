import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import { bookingMessageSchema, markReadResponseSchema, unreadCountResponseSchema } from './schemas';

// customer-app-api-map.md §10 — oldest first.
export async function getBookingMessages(bookingId: string, limit = 50) {
  const response = await apiClient.get(`/bookings/${bookingId}/messages`, { params: { limit } });
  return validateResponse(z.array(bookingMessageSchema), response, `GET /bookings/${bookingId}/messages`);
}

// `message` is trimmed server-side, must be 1-2000 chars (422 otherwise).
export async function sendBookingMessage(bookingId: string, message: string) {
  const response = await apiClient.post(`/bookings/${bookingId}/messages`, { message });
  return validateResponse(bookingMessageSchema, response, `POST /bookings/${bookingId}/messages`);
}

export async function markBookingMessagesRead(bookingId: string) {
  const response = await apiClient.put(`/bookings/${bookingId}/messages/read`);
  return validateResponse(markReadResponseSchema, response, `PUT /bookings/${bookingId}/messages/read`);
}

export async function getBookingUnreadCount(bookingId: string) {
  const response = await apiClient.get(`/bookings/${bookingId}/messages/unread-count`);
  return validateResponse(unreadCountResponseSchema, response, `GET /bookings/${bookingId}/messages/unread-count`);
}
