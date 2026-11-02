import type { AvailabilityResponse, AvailabilitySlot, Service } from '../api/schemas';
import type { BookingDraftEntry } from '../state/bookingDraftStore';

import {
  availabilityParamsFor,
  findConflictingEntries,
  getDraftBlockedIntervals,
  withDraftHolds,
} from './draftConflicts';

const service = (overrides: Partial<Service> = {}): Service => ({
  id: 'svc-haircut',
  name: 'Haircut',
  description: null,
  image: null,
  duration_minutes: 45,
  buffer_minutes: 0,
  price: 300,
  currency: 'EGP',
  requires_specialist: true,
  max_concurrent_bookings: null,
  category: null,
  ...overrides,
});

const slot = (start: string, end: string, employee: string | null, remaining: number | null = null): AvailabilitySlot => ({
  start_time: start,
  end_time: end,
  employee_id: employee,
  employee_name: employee ? `Name ${employee}` : null,
  capacity_remaining: remaining,
  time_slot_str: start,
});

const specialistAvailability = (employees: Record<string, AvailabilitySlot[]>): AvailabilityResponse => ({
  store_id: 'branch-1',
  service_id: 'svc-haircut',
  date: '2026-11-04',
  timezone: 'Africa/Cairo',
  service_duration_minutes: 45,
  step_minutes: 15,
  price: 300,
  booking_mode: 'specialist',
  employees: Object.entries(employees).map(([id, slots]) => ({
    employee_id: id,
    employee_name: `Name ${id}`,
    available_slots: slots,
  })),
  slots: [],
});

const capacityAvailability = (slots: AvailabilitySlot[]): AvailabilityResponse => ({
  ...specialistAvailability({}),
  service_id: 'svc-wash',
  booking_mode: 'capacity',
  slots,
});

const haircutAt8 = slot('2026-11-04T08:00:00.000Z', '2026-11-04T08:45:00.000Z', 'mona');

const haircutEntry: BookingDraftEntry = {
  service: service(),
  employeeId: null,
  date: '2026-11-04',
  slot: haircutAt8,
};

const blowDryEntry: BookingDraftEntry = {
  service: service({ id: 'svc-blowdry', name: 'Blow-dry' }),
  employeeId: 'sam',
  date: '2026-11-04',
  slot: slot('2026-11-04T09:00:00.000Z', '2026-11-04T09:30:00.000Z', 'sam'),
};

const washEntry: BookingDraftEntry = {
  service: service({ id: 'svc-wash', name: 'Express wash', requires_specialist: false, max_concurrent_bookings: 4 }),
  employeeId: null,
  date: '2026-11-04',
  slot: slot('2026-11-04T10:00:00.000Z', '2026-11-04T10:30:00.000Z', null, 4),
};

describe('withDraftHolds', () => {
  it("removes a specialist's slots that overlap another draft service of theirs, keeping everyone else's", () => {
    const availability = specialistAvailability({
      mona: [
        slot('2026-11-04T08:15:00.000Z', '2026-11-04T09:00:00.000Z', 'mona'), // overlaps the 08:00 hold
        slot('2026-11-04T09:00:00.000Z', '2026-11-04T09:45:00.000Z', 'mona'), // starts as the hold ends
      ],
      sam: [slot('2026-11-04T08:15:00.000Z', '2026-11-04T09:00:00.000Z', 'sam')],
    });

    const held = withDraftHolds(availability, getDraftBlockedIntervals([haircutEntry], '2026-11-04'));

    expect(held?.employees[0].available_slots.map((s) => s.start_time)).toEqual(['2026-11-04T09:00:00.000Z']);
    expect(held?.employees[1].available_slots).toHaveLength(1);
  });

  it('leaves capacity availability and other dates alone', () => {
    const capacity = capacityAvailability([washEntry.slot]);
    expect(withDraftHolds(capacity, getDraftBlockedIntervals([haircutEntry], '2026-11-04'))).toBe(capacity);
    expect(getDraftBlockedIntervals([haircutEntry], '2026-11-05')).toEqual([]);
  });
});

describe('buffer holds', () => {
  // Haircut with Mona 10:00-10:45 + 15 min buffer blocks Mona until 11:00,
  // matching the server's [starts_at, ends_at + buffer) exclusion constraint.
  const haircutWithBuffer: BookingDraftEntry = {
    service: service({ buffer_minutes: 15 }),
    employeeId: 'mona',
    date: '2026-11-04',
    slot: slot('2026-11-04T10:00:00.000Z', '2026-11-04T10:45:00.000Z', 'mona'),
  };

  it('extends the held interval by the held service buffer', () => {
    expect(getDraftBlockedIntervals([haircutWithBuffer], '2026-11-04')).toEqual([
      { employeeId: 'mona', start: '2026-11-04T10:00:00.000Z', end: '2026-11-04T11:00:00.000Z' },
    ]);
  });

  it('does not offer a back-to-back Blow-dry with the same specialist inside the buffer, but offers it after', () => {
    const availability = specialistAvailability({
      mona: [
        slot('2026-11-04T10:45:00.000Z', '2026-11-04T11:15:00.000Z', 'mona'), // inside the buffer
        slot('2026-11-04T11:00:00.000Z', '2026-11-04T11:30:00.000Z', 'mona'), // first free moment
      ],
      sam: [slot('2026-11-04T10:45:00.000Z', '2026-11-04T11:15:00.000Z', 'sam')],
    });

    const held = withDraftHolds(availability, getDraftBlockedIntervals([haircutWithBuffer], '2026-11-04'));

    expect(held?.employees[0].available_slots.map((s) => s.start_time)).toEqual(['2026-11-04T11:00:00.000Z']);
    expect(held?.employees[1].available_slots).toHaveLength(1);
  });

  it("also keeps the candidate service's own buffer clear of an earlier-starting hold", () => {
    // Blow-dry (30 min + 15 buffer) at 09:30 would block Mona until 10:15 and clash with the 10:00 hold.
    const availability = specialistAvailability({
      mona: [
        slot('2026-11-04T09:15:00.000Z', '2026-11-04T09:45:00.000Z', 'mona'),
        slot('2026-11-04T09:30:00.000Z', '2026-11-04T10:00:00.000Z', 'mona'),
      ],
    });

    const held = withDraftHolds(availability, getDraftBlockedIntervals([haircutWithBuffer], '2026-11-04'), 15);

    expect(held?.employees[0].available_slots.map((s) => s.start_time)).toEqual(['2026-11-04T09:15:00.000Z']);
  });
});

describe('availabilityParamsFor', () => {
  it('matches the params BookingFlow queries with, so invalidation hits the same cache entry', () => {
    expect(availabilityParamsFor('branch-1', haircutEntry)).toEqual({
      store_id: 'branch-1',
      service_id: 'svc-haircut',
      date: '2026-11-04',
    });
    expect(availabilityParamsFor('branch-1', blowDryEntry)).toEqual({
      store_id: 'branch-1',
      service_id: 'svc-blowdry',
      date: '2026-11-04',
      employee_id: 'sam',
    });
    expect(availabilityParamsFor('branch-1', { ...haircutEntry, excludeItemId: 'item-1' })).toEqual({
      store_id: 'branch-1',
      service_id: 'svc-haircut',
      date: '2026-11-04',
      exclude_item_id: 'item-1',
    });
    // Capacity services never send employee_id.
    expect(availabilityParamsFor('branch-1', { ...washEntry, employeeId: 'x' })).not.toHaveProperty('employee_id');
  });
});

describe('findConflictingEntries', () => {
  it('flags only the entry whose slot is no longer offered', () => {
    const fresh = {
      'svc-haircut': specialistAvailability({
        mona: [], // Mona's 08:00 was just taken
        sam: [slot('2026-11-04T08:00:00.000Z', '2026-11-04T08:45:00.000Z', 'sam')],
      }),
      'svc-blowdry': specialistAvailability({
        sam: [slot('2026-11-04T09:00:00.000Z', '2026-11-04T09:30:00.000Z', 'sam')],
      }),
      'svc-wash': capacityAvailability([slot('2026-11-04T10:00:00.000Z', '2026-11-04T10:30:00.000Z', null, 1)]),
    };

    expect(findConflictingEntries([haircutEntry, blowDryEntry, washEntry], fresh)).toEqual([haircutEntry]);
  });

  it('matches capacity slots by instant, whatever the string format', () => {
    const fresh = {
      'svc-wash': capacityAvailability([slot('2026-11-04T12:00:00+02:00', '2026-11-04T12:30:00+02:00', null, 2)]),
    };
    expect(findConflictingEntries([washEntry], fresh)).toEqual([]);
    expect(findConflictingEntries([washEntry], { 'svc-wash': capacityAvailability([]) })).toEqual([washEntry]);
  });

  it("doesn't blame an entry whose availability couldn't be refetched", () => {
    expect(findConflictingEntries([haircutEntry], {})).toEqual([]);
  });
});
