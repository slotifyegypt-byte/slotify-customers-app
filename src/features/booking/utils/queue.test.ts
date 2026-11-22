import { checkInErrorKey, checkInWindow, queueStatus } from './queue';

// Tuesday 3 Nov 2026 in Cairo (UTC+2). The booking is 17:00–17:45 local.
const booking = {
  booking_status: 'confirmed' as const,
  timezone: 'Africa/Cairo',
  booking_date: '2026-11-03T15:00:00Z',
  booking_services: [{ booking_end_time: '2026-11-03T15:45:00Z' }],
};
const at = (iso: string) => new Date(iso);

describe('checkInWindow', () => {
  it('opens an hour before the booking and closes when it ends', () => {
    expect(checkInWindow(booking, at('2026-11-03T13:59:00Z'))).toBe('early');
    expect(checkInWindow(booking, at('2026-11-03T14:00:00Z'))).toBe('open');
    expect(checkInWindow(booking, at('2026-11-03T15:45:00Z'))).toBe('open');
    expect(checkInWindow(booking, at('2026-11-03T15:46:00Z'))).toBe('closed');
  });

  it('is closed on another day, and for a booking that is not confirmed', () => {
    expect(checkInWindow(booking, at('2026-11-02T15:00:00Z'))).toBe('closed');
    expect(
      checkInWindow({ ...booking, booking_status: 'pending' }, at('2026-11-03T15:00:00Z')),
    ).toBe('closed');
    expect(
      checkInWindow({ ...booking, booking_status: 'cancelled' }, at('2026-11-03T15:00:00Z')),
    ).toBe('closed');
  });
});

describe('queueStatus', () => {
  const now = at('2026-11-03T15:05:00Z');
  const ticket = {
    number: 4,
    status: 'waiting' as const,
    dueAt: '2026-11-03T15:00:00Z',
    employeeName: 'Sami Adel',
    ahead: 2,
  };

  it('counts the people ahead once the booked time has come', () => {
    expect(queueStatus(ticket, now)).toEqual({ kind: 'ahead', count: 2 });
    expect(queueStatus({ ...ticket, ahead: 0 }, now)).toEqual({ kind: 'next' });
  });

  it('says when they will be called if they came early', () => {
    expect(queueStatus(ticket, at('2026-11-03T14:30:00Z'))).toEqual({
      kind: 'early',
      dueAt: ticket.dueAt,
    });
  });

  it('says it is their turn once called, and is done after', () => {
    expect(queueStatus({ ...ticket, status: 'serving', ahead: null }, now)).toEqual({
      kind: 'turn',
    });
    expect(queueStatus({ ...ticket, status: 'done', ahead: null }, now)).toEqual({ kind: 'done' });
  });

  it('lets them check in again after being taken out of the queue', () => {
    expect(queueStatus({ ...ticket, status: 'cancelled', ahead: null }, now)).toBeNull();
    expect(queueStatus({ ...ticket, status: 'no_show', ahead: null }, now)).toEqual({
      kind: 'missed',
    });
  });
});

describe('checkInErrorKey', () => {
  it('explains each reason the check-in was refused', () => {
    const { ApiError } = jest.requireActual('@/lib/api/errors');
    const { LocationUnavailableError } = jest.requireActual('@/lib/location/hereNow');
    expect(checkInErrorKey(new LocationUnavailableError('denied'))).toBe(
      'activity.queue.errors.locationDenied',
    );
    expect(checkInErrorKey(new LocationUnavailableError('unavailable'))).toBe(
      'activity.queue.errors.locationUnavailable',
    );
    expect(checkInErrorKey(new ApiError('too_far', 409))).toBe('activity.queue.errors.tooFar');
    expect(checkInErrorKey(new ApiError('too_early', 409))).toBe('activity.queue.errors.tooEarly');
    expect(checkInErrorKey(new ApiError('too_late', 409))).toBe('activity.queue.errors.tooLate');
    expect(checkInErrorKey(new ApiError('booking_not_confirmed', 409))).toBe(
      'activity.queue.errors.notConfirmed',
    );
    expect(checkInErrorKey(new ApiError('something_else', 500))).toBe('common.errorGeneric');
  });
});
