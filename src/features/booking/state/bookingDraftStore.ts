import { create } from 'zustand';

import type { AvailabilitySlot, Service } from '../api/schemas';
import { formatDraftDateLabel } from '../utils/dates';

export interface BookingDraftEntry {
  service: Service;
  /** null = "Any Professional" — see SpecialistPicker. */
  employeeId: string | null;
  /** Branch-local "YYYY-MM-DD". */
  date: string;
  /** Carries the UTC `start_time` that is sent as `starts_at`. */
  slot: AvailabilitySlot;
  /** Per-service note; joined into the booking's one `customer_note` on confirm. */
  note?: string;
}

interface BookingDraftState {
  storeId: string | null;
  entries: Record<string, BookingDraftEntry>;
  setEntry: (storeId: string, entry: BookingDraftEntry) => void;
  /** Drops the given services (e.g. ones whose slot was just taken), keeping the rest. */
  removeEntries: (storeId: string, serviceIds: string[]) => void;
  clear: (storeId: string) => void;
}

const EMPTY_ENTRIES: Record<string, BookingDraftEntry> = {};

// A single in-progress multi-service booking draft, keyed by the store the
// customer is currently booking at. "+ Add Service" hands a fully-configured
// service off here and sends the customer back to the store's services list
// to pick another one — there's no navigation param that could carry an
// AvailabilitySlot object across that round trip, so it needs to live
// somewhere both screens can reach.
export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  storeId: null,
  entries: {},
  setEntry: (storeId, entry) =>
    set((state) => ({
      storeId,
      // Switching to a different store starts a fresh draft rather than
      // mixing services from two stores into one booking.
      entries:
        state.storeId === storeId
          ? { ...state.entries, [entry.service.id]: entry }
          : { [entry.service.id]: entry },
    })),
  removeEntries: (storeId, serviceIds) =>
    set((state) => {
      if (state.storeId !== storeId || serviceIds.length === 0) return state;
      const entries = { ...state.entries };
      for (const id of serviceIds) delete entries[id];
      return { entries };
    }),
  clear: (storeId) =>
    set((state) => (state.storeId === storeId ? { storeId: null, entries: {} } : state)),
}));

/** Configured services for `storeId`, or a stable empty object if the draft belongs to a different store. */
export function useDraftEntries(storeId: string): Record<string, BookingDraftEntry> {
  return useBookingDraftStore((state) =>
    state.storeId === storeId ? state.entries : EMPTY_ENTRIES,
  );
}

// Matches the "Any pro · Today · 3:30" summary shown on the store's services
// list once a service has been configured (24-booking-configure.png flow).
// `timeZone` is the branch's: "Today" means the branch's today.
export function formatDraftSummary(
  entry: BookingDraftEntry,
  timeZone: string,
  now: Date = new Date(),
): string {
  const dateLabel = formatDraftDateLabel(entry.date, timeZone, now);
  const timeLabel = entry.slot.time_slot_str;
  if (!entry.service.requires_specialist) {
    return `${dateLabel} · ${timeLabel}`;
  }
  const specialistLabel =
    entry.employeeId === null
      ? 'Any pro' /* TODO i18n */
      : (entry.slot.employee_name ?? 'Specialist'); /* TODO i18n */
  return `${specialistLabel} · ${dateLabel} · ${timeLabel}`;
}
