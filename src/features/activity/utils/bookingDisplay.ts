import type { BookingRead, BookingStatus } from '@/features/booking/api/schemas';
import { branchLocalDate } from '@/lib/time/branchTime';

import { daysFromToday } from './dateLabels';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface StatusMeta {
  /** i18n key of the sentence-case label. */
  labelKey: string;
  tone: StatusTone;
}

/** `booking_type` 'drop_off' is capacity mode (tailoring, car wash): there is no appointment with a specialist. */
export function isOrderBooking(booking: Pick<BookingRead, 'booking_type'>): boolean {
  return booking.booking_type === 'drop_off';
}

/**
 * The word and tone for a booking's state. There is no queue or stage field on the backend, so a pending order
 * reads "In progress" (it has been dropped off) and a pending appointment reads "Pending" (awaiting the venue).
 */
export function bookingStatusMeta(
  booking: Pick<BookingRead, 'booking_status' | 'booking_type'>,
): StatusMeta {
  const status: BookingStatus = booking.booking_status;
  switch (status) {
    case 'confirmed':
      return { labelKey: 'activity.status.confirmed', tone: 'success' };
    case 'pending':
      return isOrderBooking(booking)
        ? { labelKey: 'activity.status.inProgress', tone: 'warning' }
        : { labelKey: 'activity.status.pending', tone: 'warning' };
    case 'completed':
      return { labelKey: 'activity.status.completed', tone: 'neutral' };
    case 'cancelled':
      return { labelKey: 'activity.status.cancelled', tone: 'danger' };
    case 'no_show':
    default:
      return { labelKey: 'activity.status.noShow', tone: 'danger' };
  }
}

export type ActiveGroupKey = 'today' | 'upcoming' | 'earlier';

export interface ActiveGroup {
  key: ActiveGroupKey;
  bookings: BookingRead[];
}

/**
 * Active bookings grouped by branch-local day: today first, then what is coming, then confirmed/pending
 * bookings whose day has already passed (the backend does not move them on by itself). Soonest first within a
 * group, except "earlier", which lists the most recent first.
 */
export function groupActiveBookings(
  bookings: BookingRead[],
  now: Date = new Date(),
): ActiveGroup[] {
  const byTime = (a: BookingRead, b: BookingRead) =>
    Date.parse(a.booking_date) - Date.parse(b.booking_date);
  const today: BookingRead[] = [];
  const upcoming: BookingRead[] = [];
  const earlier: BookingRead[] = [];
  for (const booking of bookings) {
    const days = daysFromToday(booking.booking_date, booking.timezone, now);
    (days === 0 ? today : days > 0 ? upcoming : earlier).push(booking);
  }
  const groups: ActiveGroup[] = [
    { key: 'today', bookings: today.sort(byTime) },
    { key: 'upcoming', bookings: upcoming.sort(byTime) },
    { key: 'earlier', bookings: earlier.sort((a, b) => byTime(b, a)) },
  ];
  return groups.filter((g) => g.bookings.length > 0);
}

export interface PastGroup {
  /** "YYYY-MM" in the branch's time zone. */
  month: string;
  /** Any booking's instant and zone in the month, for the heading. */
  sample: Pick<BookingRead, 'booking_date' | 'timezone'>;
  bookings: BookingRead[];
}

/** Past bookings, newest first, grouped by branch-local month. */
export function groupPastBookings(bookings: BookingRead[]): PastGroup[] {
  const sorted = [...bookings].sort(
    (a, b) => Date.parse(b.booking_date) - Date.parse(a.booking_date),
  );
  const groups: PastGroup[] = [];
  for (const booking of sorted) {
    const month = branchLocalDate(booking.booking_date, booking.timezone).slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.month === month) {
      last.bookings.push(booking);
    } else {
      groups.push({ month, sample: booking, bookings: [booking] });
    }
  }
  return groups;
}
