import { fromPostgrest } from '@/lib/api/errors';
import { supabase } from '@/lib/supabase';

// developer-guide.md "Walk-in queue → Customer app": a booked customer joins the branch's queue when they
// arrive ("I'm here"), then watches their place in line until they are called.

export type QueueTicketStatus = 'waiting' | 'serving' | 'done' | 'no_show' | 'cancelled';

export interface MyQueueTicket {
  number: number;
  status: QueueTicketStatus;
  /** When the booked slot starts (UTC ISO). */
  dueAt: string | null;
  /** Who will serve them (their specialist, or whoever called them). */
  employeeName: string | null;
  /** People the same staff member will call first; null unless waiting. */
  ahead: number | null;
}

/**
 * "I'm here": puts the customer's booking in today's queue. The backend checks it is their confirmed booking of
 * today, from an hour before until it ends, and that `here` is within 500 m of the branch.
 * Errors (ApiError.code): booking_not_confirmed, not_today, too_early, too_late, location_required, too_far,
 * already_checked_in, booking_not_found.
 */
export async function checkInHere(
  bookingId: string,
  here: { latitude: number; longitude: number },
): Promise<{ number: number }> {
  const { data, error } = await supabase.rpc('queue_customer_check_in', {
    p_booking_id: bookingId,
    p_latitude: here.latitude,
    p_longitude: here.longitude,
  });
  if (error) throw fromPostgrest(error);
  return { number: data.number };
}

/** The customer's ticket for this booking today, or null when they are not in the queue. */
export async function getMyQueueTicket(bookingId: string): Promise<MyQueueTicket | null> {
  const { data, error } = await supabase.rpc('get_my_queue_ticket', { p_booking_id: bookingId });
  if (error) throw fromPostgrest(error);
  const row = data?.[0];
  if (!row) return null;
  return {
    number: row.ticket_number,
    status: row.status,
    dueAt: row.due_at,
    employeeName: row.employee_name,
    ahead: row.ahead,
  };
}
