
import { ApiError } from '@/lib/api/errors';
import { LocationUnavailableError } from '@/lib/location/hereNow';
import { branchLocalDate } from '@/lib/time/branchTime';

import type { MyQueueTicket } from '../api/queueApi';
import type { BookingRead } from '../api/schemas';

/** How early "I'm here" opens; the backend uses the same hour. */
export const CHECK_IN_OPENS_MIN = 60;

type WindowBooking = Pick<BookingRead, 'booking_status' | 'timezone' | 'booking_date'> & {
  booking_services: Pick<BookingRead['booking_services'][number], 'booking_end_time'>[];
};

/**
 * Whether "I'm here" can be offered now: `open` from an hour before a confirmed booking of today until it ends,
 * `early` earlier that day (the card says when it opens), `closed` otherwise. The backend has the final word.
 */
export function checkInWindow(
  booking: WindowBooking,
  now: Date = new Date(),
): 'open' | 'early' | 'closed' {
  if (booking.booking_status !== 'confirmed') return 'closed';
  if (
    branchLocalDate(booking.booking_date, booking.timezone) !==
    branchLocalDate(now, booking.timezone)
  )
    return 'closed';
  const start = Date.parse(booking.booking_date);
  const end = Math.max(
    start,
    ...booking.booking_services.map((s) => Date.parse(s.booking_end_time)),
  );
  if (now.getTime() > end) return 'closed';
  return now.getTime() >= start - CHECK_IN_OPENS_MIN * 60_000 ? 'open' : 'early';
}

export type QueueStatus =
  | { kind: 'early'; dueAt: string }
  | { kind: 'next' }
  | { kind: 'ahead'; count: number }
  | { kind: 'turn' }
  | { kind: 'done' }
  | { kind: 'missed' };

/**
 * What the booking screen says about the customer's place in line. Null when they are not in the queue any
 * more (taken out by the desk): they may check in again.
 */
export function queueStatus(ticket: MyQueueTicket, now: Date = new Date()): QueueStatus | null {
  switch (ticket.status) {
    case 'serving':
      return { kind: 'turn' };
    case 'done':
      return { kind: 'done' };
    case 'no_show':
      return { kind: 'missed' };
    case 'cancelled':
      return null;
    case 'waiting':
      // Early arrivals are called at their time, after the walk-ins: a count would only grow, so give the time.
      if (ticket.dueAt && Date.parse(ticket.dueAt) > now.getTime())
        return { kind: 'early', dueAt: ticket.dueAt };
      return ticket.ahead ? { kind: 'ahead', count: ticket.ahead } : { kind: 'next' };
  }
}

const CHECK_IN_ERRORS: Record<string, string> = {
  too_far: 'activity.queue.errors.tooFar',
  too_early: 'activity.queue.errors.tooEarly',
  too_late: 'activity.queue.errors.tooLate',
  booking_not_confirmed: 'activity.queue.errors.notConfirmed',
  location_required: 'activity.queue.errors.locationUnavailable',
};

/** The translation key that tells the customer why "I'm here" did not work. */
export function checkInErrorKey(error: unknown): string {
  if (error instanceof LocationUnavailableError) {
    return error.reason === 'denied'
      ? 'activity.queue.errors.locationDenied'
      : 'activity.queue.errors.locationUnavailable';
  }
  if (error instanceof ApiError) return CHECK_IN_ERRORS[error.code] ?? 'common.errorGeneric';
  return 'common.errorGeneric';
}
