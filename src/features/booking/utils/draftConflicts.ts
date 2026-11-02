import type { AvailabilityParams } from '../api/bookingApi';
import type { AvailabilityResponse, AvailabilitySlot } from '../api/schemas';
import type { BookingDraftEntry } from '../state/bookingDraftStore';

export interface BlockedInterval {
  employeeId: string;
  start: string;
  end: string;
}

function intervalsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return Date.parse(aStart) < Date.parse(bEnd) && Date.parse(bStart) < Date.parse(aEnd);
}

const MINUTE_MS = 60_000;

function sameInstant(a: string, b: string): boolean {
  return Date.parse(a) === Date.parse(b);
}

// The availability function only knows bookings already persisted in the
// DB — it can't see this draft's OTHER services, since none of them are
// submitted until the whole multi-service draft is confirmed together.
// Without this, the same specialist/time could be picked for two services in
// one draft and only surface as a conflict at final confirm.
//
// The server's exclusion constraint blocks `[starts_at, ends_at + buffer)`, so
// each held interval runs to the slot's end PLUS its service's buffer.
export function getDraftBlockedIntervals(otherEntries: BookingDraftEntry[], date: string): BlockedInterval[] {
  return otherEntries
    .filter((entry) => entry.date === date && entry.slot.employee_id)
    .map((entry) => ({
      employeeId: entry.slot.employee_id as string,
      start: entry.slot.start_time,
      end: new Date(Date.parse(entry.slot.end_time) + entry.service.buffer_minutes * MINUTE_MS).toISOString(),
    }));
}

/**
 * Drops specialist slots that collide with `blocked`. The server only ever
 * returns free slots, so a held slot simply disappears like any taken one —
 * and with "Any specialist" another free employee at that time can take its
 * place in the merged grid. `bufferMinutes` is the buffer of the service whose
 * grid this is: a slot's own buffer must also clear a later hold.
 */
export function withDraftHolds(
  availability: AvailabilityResponse | undefined,
  blocked: BlockedInterval[],
  bufferMinutes = 0,
): AvailabilityResponse | undefined {
  if (!availability || blocked.length === 0 || availability.booking_mode !== 'specialist') {
    return availability;
  }

  const isBlocked = (slot: AvailabilitySlot) =>
    slot.employee_id != null &&
    blocked.some(
      (interval) =>
        interval.employeeId === slot.employee_id &&
        intervalsOverlap(
          slot.start_time,
          new Date(Date.parse(slot.end_time) + bufferMinutes * MINUTE_MS).toISOString(),
          interval.start,
          interval.end,
        ),
    );

  return {
    ...availability,
    employees: availability.employees.map((employee) => ({
      ...employee,
      available_slots: employee.available_slots.filter((slot) => !isBlocked(slot)),
    })),
  };
}

/**
 * The availability query params for one configured service — the single
 * source BookingFlow and conflict recovery both use, so invalidating a
 * draft entry's availability hits exactly the cache entry its grid shows.
 */
export function availabilityParamsFor(
  storeId: string,
  entry: Pick<BookingDraftEntry, 'service' | 'employeeId' | 'date'> & { excludeItemId?: string },
): AvailabilityParams {
  return {
    store_id: storeId,
    service_id: entry.service.id,
    date: entry.date,
    ...(entry.service.requires_specialist && entry.employeeId ? { employee_id: entry.employeeId } : {}),
    ...(entry.excludeItemId ? { exclude_item_id: entry.excludeItemId } : {}),
  };
}

/** Whether `fresh` availability still offers the slot an entry picked. */
function isStillOffered(entry: BookingDraftEntry, fresh: AvailabilityResponse): boolean {
  const { slot } = entry;
  if (fresh.booking_mode === 'capacity') {
    return fresh.slots.some((candidate) => sameInstant(candidate.start_time, slot.start_time));
  }
  const employee = fresh.employees.find((candidate) => candidate.employee_id === slot.employee_id);
  return employee?.available_slots.some((candidate) => sameInstant(candidate.start_time, slot.start_time)) ?? false;
}

/**
 * After a `slot_taken`/`slot_unavailable`/`time_in_past` on create, the
 * server doesn't say WHICH item failed. Re-reading availability tells us:
 * an entry whose picked slot is no longer offered is the conflicting one.
 * Entries whose availability couldn't be refetched (missing from
 * `freshByServiceId`) are never blamed.
 */
export function findConflictingEntries(
  entries: BookingDraftEntry[],
  freshByServiceId: Record<string, AvailabilityResponse | undefined>,
): BookingDraftEntry[] {
  return entries.filter((entry) => {
    const fresh = freshByServiceId[entry.service.id];
    return fresh !== undefined && !isStillOffered(entry, fresh);
  });
}
