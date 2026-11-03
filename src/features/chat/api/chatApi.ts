import { ApiError, fromPostgrest } from '@/lib/api/errors';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

import type { BookingMessage } from './schemas';

// `authenticated` is granted SELECT on these columns (plus the two sender ids,
// which the app never needs). Selecting anything else fails with 42501.
const MESSAGE_COLUMNS = 'id, booking_id, sender, body, read_at, created_at';

const MAX_BODY_LENGTH = 2000;

type MessageInsert = Database['public']['Tables']['booking_messages']['Insert'];

export type MessageRow = Pick<
  Database['public']['Tables']['booking_messages']['Row'],
  'id' | 'booking_id' | 'sender' | 'body' | 'read_at' | 'created_at'
>;

// Shared by REST rows and Realtime `payload.new` so both land in the cache in
// the same shape.
export function toBookingMessage(row: MessageRow): BookingMessage {
  return {
    id: row.id,
    booking_id: row.booking_id,
    sender: row.sender,
    message: row.body,
    read_at: row.read_at,
    created_at: row.created_at,
  };
}

// developer-guide.md §7 — newest `limit` rows, returned oldest-first.
export async function getBookingMessages(bookingId: string, limit = 50): Promise<BookingMessage[]> {
  const { data, error } = await supabase
    .from('booking_messages')
    .select(MESSAGE_COLUMNS)
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw fromPostgrest(error);
  return (data ?? []).map(toBookingMessage).reverse();
}

// The database only accepts 1–4000 chars; the app caps at 2000. The generated
// Insert type lists `sender` as required, but the `booking_messages_before_insert`
// trigger derives it (and the sender ids) from the login, and `authenticated`
// is only granted INSERT on (booking_id, body) — so only those two are sent.
// RLS refusal (not your booking) shows up as an insert that returns no row.
export async function sendBookingMessage(bookingId: string, body: string): Promise<BookingMessage> {
  const text = body.trim();
  if (text.length < 1 || text.length > MAX_BODY_LENGTH) {
    throw new ApiError('invalid_input', 422, `message must be 1-${MAX_BODY_LENGTH} characters`);
  }
  const { data, error } = await supabase
    .from('booking_messages')
    .insert({ booking_id: bookingId, body: text } as MessageInsert)
    .select(MESSAGE_COLUMNS);
  if (error) throw fromPostgrest(error);
  if (!data?.length) throw new ApiError('forbidden', 403, 'message not sent');
  return toBookingMessage(data[0]);
}

// Marks the branch's messages on this booking as read (`read_at = now()`).
export async function markBookingMessagesRead(bookingId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_messages_read', { p_booking_id: bookingId });
  if (error) throw fromPostgrest(error);
}
