import { ApiError } from '@/lib/api/errors';

import { getBookingErrorMessage, isSlotConflict, slotConflictMessage } from './bookingErrors';

describe('isSlotConflict', () => {
  it('is true for slot_taken and slot_unavailable only', () => {
    expect(isSlotConflict(new ApiError('slot_taken', 409))).toBe(true);
    expect(isSlotConflict(new ApiError('slot_unavailable', 409))).toBe(true);
    expect(isSlotConflict(new ApiError('employee_unavailable', 422))).toBe(false);
    expect(isSlotConflict(new Error('slot_taken'))).toBe(false);
    expect(isSlotConflict(undefined)).toBe(false);
  });
});

describe('getBookingErrorMessage', () => {
  it("returns the server's human message", () => {
    const error = new ApiError('employee_required', 422, 'Choose who should do Haircut.');
    expect(getBookingErrorMessage(error, 'fallback')).toBe('Choose who should do Haircut.');
  });

  it('falls back when the message is just the machine code', () => {
    // e.g. errorResponse(404, 'branch_not_found') has message === code.
    expect(getBookingErrorMessage(new ApiError('branch_not_found', 404), 'fallback')).toBe(
      'fallback',
    );
    expect(getBookingErrorMessage(new ApiError('network_error', 0), 'fallback')).toBe('fallback');
  });

  it('falls back for anything that is not an ApiError', () => {
    expect(getBookingErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
    expect(getBookingErrorMessage('nope', 'fallback')).toBe('fallback');
  });
});

describe('slotConflictMessage', () => {
  const taken = new ApiError(
    'slot_taken',
    409,
    'Someone just booked this time. Please pick another.',
  );

  it('says the time was just taken, naming the services that lost their slot', () => {
    expect(slotConflictMessage(taken, [])).toBe('That time was just taken — pick another');
    expect(slotConflictMessage(taken, [{ service: { name: 'Blow-dry' } }])).toBe(
      'That time for Blow-dry was just taken — pick another',
    );
  });

  it("uses the server's text for slot_unavailable when it has one", () => {
    const outside = new ApiError('slot_unavailable', 409, 'Mona is not working at that time.');
    expect(slotConflictMessage(outside, [])).toBe('Mona is not working at that time.');
    expect(slotConflictMessage(outside, [{ service: { name: 'Haircut' } }])).toBe(
      'Haircut: Mona is not working at that time.',
    );
    // A bare machine code carries no text: keep the generic wording.
    const bare = new ApiError('slot_unavailable', 409);
    expect(slotConflictMessage(bare, [])).toBe('That time was just taken — pick another');
  });

  it("uses the server's text for time_in_past", () => {
    const past = new ApiError('time_in_past', 422, 'Choose a time in the future.');
    expect(slotConflictMessage(past, [])).toBe('Choose a time in the future.');
    expect(slotConflictMessage(past, [{ service: { name: 'Haircut' } }])).toBe(
      'Haircut: Choose a time in the future.',
    );
  });
});
