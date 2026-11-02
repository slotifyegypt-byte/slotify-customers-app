import type { AvailabilitySlot, Service } from '../api/schemas';

import { formatDraftSummary, useBookingDraftStore, type BookingDraftEntry } from './bookingDraftStore';

const entry = (id: string, overrides: Partial<BookingDraftEntry> = {}): BookingDraftEntry => ({
  service: { id, name: id, requires_specialist: true } as Service,
  employeeId: null,
  date: '2026-11-04',
  slot: {
    start_time: '2026-11-04T08:00:00.000Z',
    end_time: '2026-11-04T08:45:00.000Z',
    employee_id: 'mona',
    employee_name: 'Mona Hassan',
    capacity_remaining: null,
    time_slot_str: '10:00 AM',
  } as AvailabilitySlot,
  ...overrides,
});

beforeEach(() => {
  useBookingDraftStore.setState({ storeId: null, entries: {} });
});

describe('removeEntries', () => {
  it('drops only the named services and keeps the rest of the draft', () => {
    const { setEntry } = useBookingDraftStore.getState();
    setEntry('branch-1', entry('a'));
    setEntry('branch-1', entry('b'));
    setEntry('branch-1', entry('c'));

    useBookingDraftStore.getState().removeEntries('branch-1', ['b']);

    expect(Object.keys(useBookingDraftStore.getState().entries)).toEqual(['a', 'c']);
    expect(useBookingDraftStore.getState().storeId).toBe('branch-1');
  });

  it('ignores a different store', () => {
    useBookingDraftStore.getState().setEntry('branch-1', entry('a'));
    useBookingDraftStore.getState().removeEntries('branch-2', ['a']);
    expect(Object.keys(useBookingDraftStore.getState().entries)).toEqual(['a']);
  });
});

describe('formatDraftSummary', () => {
  it('labels the day relative to the branch zone', () => {
    const now = new Date('2026-11-02T23:30:00Z'); // already 3 Nov in Warsaw
    expect(formatDraftSummary(entry('a', { date: '2026-11-03' }), 'Europe/Warsaw', now)).toBe('Any pro · Today · 10:00 AM');
    expect(
      formatDraftSummary(entry('a', { date: '2026-11-04', employeeId: 'mona' }), 'Europe/Warsaw', now),
    ).toBe('Mona Hassan · Tomorrow · 10:00 AM');
  });
});
