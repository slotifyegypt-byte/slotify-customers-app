import type { BookingRead } from '@/features/booking/api/schemas';

import {
  canCustomerCancel,
  bookingStatusMeta,
  groupActiveBookings,
  groupPastBookings,
} from './bookingDisplay';

const NOW = new Date('2026-11-12T07:00:00Z');

function booking(id: string, date: string, extra: Partial<BookingRead> = {}): BookingRead {
  return {
    id,
    booking_date: date,
    timezone: 'Africa/Cairo',
    booking_status: 'confirmed',
    booking_type: 'appointment',
    ...extra,
  } as BookingRead;
}

describe('bookingStatusMeta', () => {
  it('uses sentence-case keys and calm tones', () => {
    expect(bookingStatusMeta(booking('a', NOW.toISOString()))).toEqual({
      labelKey: 'activity.status.confirmed',
      tone: 'success',
    });
    expect(
      bookingStatusMeta(booking('a', NOW.toISOString(), { booking_status: 'cancelled' })).tone,
    ).toBe('danger');
    expect(
      bookingStatusMeta(booking('a', NOW.toISOString(), { booking_status: 'completed' })).tone,
    ).toBe('neutral');
  });

  it('reads a pending order as in progress and a pending appointment as pending', () => {
    expect(
      bookingStatusMeta(booking('a', NOW.toISOString(), { booking_status: 'pending' })).labelKey,
    ).toBe('activity.status.pending');
    expect(
      bookingStatusMeta(
        booking('a', NOW.toISOString(), { booking_status: 'pending', booking_type: 'drop_off' }),
      ).labelKey,
    ).toBe('activity.status.inProgress');
  });
});

describe('groupActiveBookings', () => {
  it('orders today, upcoming, then earlier, soonest first', () => {
    const groups = groupActiveBookings(
      [
        booking('later', '2026-11-20T10:00:00Z'),
        booking('old', '2026-11-06T10:00:00Z'),
        booking('today-pm', '2026-11-12T13:00:00Z'),
        booking('soon', '2026-11-14T10:00:00Z'),
        booking('today-am', '2026-11-12T08:00:00Z'),
      ],
      NOW,
    );
    expect(groups.map((g) => g.key)).toEqual(['today', 'upcoming', 'earlier']);
    expect(groups[0].bookings.map((b) => b.id)).toEqual(['today-am', 'today-pm']);
    expect(groups[1].bookings.map((b) => b.id)).toEqual(['soon', 'later']);
    expect(groups[2].bookings.map((b) => b.id)).toEqual(['old']);
  });

  it('leaves out empty groups', () => {
    expect(
      groupActiveBookings([booking('x', '2026-11-20T10:00:00Z')], NOW).map((g) => g.key),
    ).toEqual(['upcoming']);
  });
});

describe('groupPastBookings', () => {
  it('groups newest first by branch-local month', () => {
    const groups = groupPastBookings([
      booking('oct-1', '2026-10-01T10:00:00Z'),
      booking('nov', '2026-11-03T10:00:00Z'),
      booking('oct-2', '2026-10-20T10:00:00Z'),
    ]);
    expect(groups.map((g) => g.month)).toEqual(['2026-11', '2026-10']);
    expect(groups[1].bookings.map((b) => b.id)).toEqual(['oct-2', 'oct-1']);
  });
});

describe('canCustomerCancel', () => {
  const now = new Date('2026-11-07T08:00:00Z');
  const base = (over: Record<string, unknown>) =>
    ({
      booking_status: 'confirmed',
      booking_type: 'appointment',
      booking_date: '2026-11-07T10:00:00Z',
      ...over,
    }) as Parameters<typeof canCustomerCancel>[0];

  it('lets a pending or confirmed appointment be cancelled', () => {
    expect(canCustomerCancel(base({}), now)).toBe(true);
    expect(canCustomerCancel(base({ booking_status: 'pending' }), now)).toBe(true);
  });

  it('lets a drop-off order be cancelled only before its start time', () => {
    expect(canCustomerCancel(base({ booking_type: 'drop_off' }), now)).toBe(true);
    expect(
      canCustomerCancel(
        base({ booking_type: 'drop_off', booking_date: '2026-11-07T07:00:00Z' }),
        now,
      ),
    ).toBe(false);
  });

  it('never offers cancel for a booking that is already finished', () => {
    for (const booking_status of ['completed', 'cancelled', 'no_show']) {
      expect(canCustomerCancel(base({ booking_status }), now)).toBe(false);
      expect(canCustomerCancel(base({ booking_status, booking_type: 'drop_off' }), now)).toBe(
        false,
      );
    }
  });
});
