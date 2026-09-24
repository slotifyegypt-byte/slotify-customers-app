import { create } from 'zustand';

import type { AvailabilitySlot, Service } from '../api/schemas';
import { formatDraftDateLabel } from '../utils/time';

export interface BookingDraftEntry {
  service: Service;
  /** null = "Any Professional" — see SpecialistPicker. */
  employeeId: string | null;
  /** yyyy-MM-dd */
  date: string;
  slot: AvailabilitySlot;
  note?: string;
}

interface BookingDraftState {
  storeId: string | null;
  entries: Record<string, BookingDraftEntry>;
  setEntry: (storeId: string, entry: BookingDraftEntry) => void;
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
      entries: state.storeId === storeId ? { ...state.entries, [entry.service.id]: entry } : { [entry.service.id]: entry },
    })),
  clear: (storeId) => set((state) => (state.storeId === storeId ? { storeId: null, entries: {} } : state)),
}));

/** Configured services for `storeId`, or a stable empty object if the draft belongs to a different store. */
export function useDraftEntries(storeId: string): Record<string, BookingDraftEntry> {
  return useBookingDraftStore((state) => (state.storeId === storeId ? state.entries : EMPTY_ENTRIES));
}

// Matches the "Any pro · Today · 3:30" summary shown on the store's services
// list once a service has been configured (24-booking-configure.png flow).
export function formatDraftSummary(entry: BookingDraftEntry): string {
  const dateLabel = formatDraftDateLabel(entry.date);
  const timeLabel = entry.slot.time_slot_str;
  if (!entry.service.requires_specialist) {
    return `${dateLabel} · ${timeLabel}`;
  }
  const specialistLabel = entry.employeeId === null ? 'Any pro' /* TODO i18n */ : entry.slot.employee_name ?? 'Specialist' /* TODO i18n */;
  return `${specialistLabel} · ${dateLabel} · ${timeLabel}`;
}
