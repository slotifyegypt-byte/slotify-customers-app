import type { AvailabilityResponse, AvailabilitySlot } from '../api/schemas';
import type { BookingDraftEntry } from '../state/bookingDraftStore';

export interface BlockedInterval {
  employeeId: string;
  start: string;
  end: string;
}

function intervalsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

// The backend's /availability check (and the create-booking validation) only
// looks at bookings already persisted in the DB — it has no visibility into
// this draft's OTHER services, since none of them are submitted until the
// whole multi-service draft is confirmed together. Without this, the same
// specialist/time could be picked for two services in one draft and only
// surface as a conflict (or silently double-book) at final confirm.
export function getDraftBlockedIntervals(otherEntries: BookingDraftEntry[], date: string): BlockedInterval[] {
  return otherEntries
    .filter((entry) => entry.date === date && entry.slot.employee_id)
    .map((entry) => ({
      employeeId: entry.slot.employee_id as string,
      start: entry.slot.start_time,
      end: entry.slot.end_time,
    }));
}

/** Marks specialist slots that collide with `blocked` as unavailable, so SlotGrid renders them disabled like any other taken slot. */
export function withDraftHolds(
  availability: AvailabilityResponse | undefined,
  blocked: BlockedInterval[],
): AvailabilityResponse | undefined {
  if (!availability || blocked.length === 0 || availability.booking_mode !== 'specialist') {
    return availability;
  }

  const isBlocked = (slot: AvailabilitySlot) =>
    slot.employee_id != null &&
    blocked.some(
      (interval) =>
        interval.employeeId === slot.employee_id &&
        intervalsOverlap(slot.start_time, slot.end_time, interval.start, interval.end),
    );

  return {
    ...availability,
    employees: availability.employees.map((employee) => ({
      ...employee,
      available_slots: employee.available_slots.map((slot) =>
        slot.is_available && isBlocked(slot) ? { ...slot, is_available: false } : slot,
      ),
    })),
  };
}
