import type { AvailabilityResponse, AvailabilitySlot } from '../api/schemas';

import { mergeSpecialistSlots } from './slots';

const slot = (start: string, employee: string): AvailabilitySlot => ({
  start_time: start,
  end_time: start,
  employee_id: employee,
  employee_name: employee,
  capacity_remaining: null,
  time_slot_str: start,
});

const employees = (byId: Record<string, string[]>): AvailabilityResponse['employees'] =>
  Object.entries(byId).map(([id, starts]) => ({
    employee_id: id,
    employee_name: id,
    available_slots: starts.map((start) => slot(start, id)),
  }));

describe('mergeSpecialistSlots ("Any specialist")', () => {
  it('builds one earliest-first list across employees', () => {
    const merged = mergeSpecialistSlots(
      employees({
        mona: ['2026-11-04T10:00:00.000Z', '2026-11-04T10:15:00.000Z'],
        tarek: ['2026-11-04T08:00:00.000Z', '2026-11-04T12:00:00.000Z'],
      }),
    );
    expect(merged.map((s) => [s.start_time, s.employee_id])).toEqual([
      ['2026-11-04T08:00:00.000Z', 'tarek'],
      ['2026-11-04T10:00:00.000Z', 'mona'],
      ['2026-11-04T10:15:00.000Z', 'mona'],
      ['2026-11-04T12:00:00.000Z', 'tarek'],
    ]);
  });

  it('shows a time once and gives it to the first listed employee who is free', () => {
    const merged = mergeSpecialistSlots(
      employees({
        sam: [],
        mona: ['2026-11-04T10:00:00.000Z'],
        tarek: ['2026-11-04T10:00:00.000Z'],
      }),
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].employee_id).toBe('mona');
  });

  it('is empty when nobody has a free slot', () => {
    expect(mergeSpecialistSlots(employees({ sam: [], mona: [] }))).toEqual([]);
  });
});
