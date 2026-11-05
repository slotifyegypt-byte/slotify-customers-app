import { compareBranchServices, toService } from '@/features/venue/api/mappers';
import { getStoreTeam } from '@/features/venue/api/venueApi';
import { fromPostgrest } from '@/lib/api/errors';
import { callFunction, callPublicFunction } from '@/lib/api/functions';
import { parseOrReport } from '@/lib/api/parse';
import { supabase } from '@/lib/supabase';

import type { BookingDraftEntry } from '../state/bookingDraftStore';

import { toAvailability, toBooking, BOOKING_SELECT, type BookingRow } from './mappers';
import {
  availabilityDocSchema,
  createdBookingSchema,
  type AvailabilityResponse,
  type BookingEmployee,
  type BookingRead,
  type BookingStatus,
  type Service,
} from './schemas';

// developer-guide.md §5 "My bookings". RLS alone is not enough: a login that is
// also partner staff can read its branch's bookings, so the query is scoped to
// the customer row. `reviews` is embedded so `has_review` needs no second call.
export async function getMyBookings(
  customerId: string,
  status?: BookingStatus,
): Promise<BookingRead[]> {
  let query = supabase.from('bookings').select(BOOKING_SELECT).eq('customer_id', customerId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('starts_at', { ascending: false });
  if (error) throw fromPostgrest(error);
  return ((data ?? []) as unknown as BookingRow[]).map((row) => toBooking(row));
}

export async function getBooking(bookingId: string): Promise<BookingRead> {
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', bookingId)
    .single();
  if (error) throw fromPostgrest(error);
  return toBooking(data as unknown as BookingRow);
}

// developer-guide.md §5 "Cancel" — `transition_booking` raises PT409
// `invalid_transition` when the booking is already completed/cancelled/etc.
export async function cancelBooking(bookingId: string, reason?: string): Promise<BookingRead> {
  const { error } = await supabase.rpc('transition_booking', {
    p_booking_id: bookingId,
    p_to_status: 'cancelled',
    ...(reason ? { p_reason: reason } : {}),
  });
  if (error) throw fromPostgrest(error);
  return getBooking(bookingId);
}

// developer-guide.md §5 — services the branch offers. The branch currency
// comes from `branch_cards` (services carry only a bare amount), fetched in
// parallel with the services themselves.
export async function getStoreServices(branchId: string): Promise<Service[]> {
  const [card, rows] = await Promise.all([
    supabase.from('branch_cards').select('currency').eq('id', branchId).single(),
    supabase
      .from('branch_services')
      .select(
        'price, is_active, service:services(id, name, description, image_path, duration_minutes, buffer_minutes, booking_mode, capacity, price, sort_order, archived_at, category:service_categories(id, name, sort_order))',
      )
      .eq('branch_id', branchId)
      .eq('is_active', true),
  ]);
  if (card.error) throw fromPostgrest(card.error);
  if (rows.error) throw fromPostgrest(rows.error);

  return [...(rows.data ?? [])]
    .sort(compareBranchServices)
    .map((row) => toService(row, card.data.currency))
    .filter((service): service is Service => service !== null);
}

// developer-guide.md §5 — one `get_branch_team` call, narrowed to the members
// who perform this service.
export async function getStoreEmployeesForService(
  branchId: string,
  serviceId: string,
): Promise<BookingEmployee[]> {
  const team = await getStoreTeam(branchId);
  return team
    .filter((member) => member.service_ids.includes(serviceId))
    .map((member) => ({
      id: member.id,
      first_name: member.first_name,
      last_name: member.last_name,
      profile_picture: member.profile_picture,
      role_name: member.role_name,
      rating: null,
    }));
}

export interface AvailabilityParams {
  store_id: string;
  service_id: string;
  /** The BRANCH's local date, "YYYY-MM-DD" (developer-guide.md §6). */
  date: string;
  employee_id?: string;
  /** Reschedule only: the `booking_items.id` being moved, so its own slot (and buffer) counts as free. */
  exclude_item_id?: string;
}

// developer-guide.md §6 — public (apikey only). `stream=0` asks for one JSON
// document instead of NDJSON frames: same data, no streaming fetch needed.
// An unknown/inactive branch is a 404 `branch_not_found` ApiError; a day with
// no free slots is an ordinary empty result.
export async function getAvailability(params: AvailabilityParams): Promise<AvailabilityResponse> {
  const doc = await callPublicFunction<unknown>('availability', {
    branch_id: params.store_id,
    service_id: params.service_id,
    date: params.date,
    ...(params.employee_id ? { employee_id: params.employee_id } : {}),
    ...(params.exclude_item_id ? { exclude_item_id: params.exclude_item_id } : {}),
    stream: '0',
  });
  return toAvailability(parseOrReport(availabilityDocSchema, doc, 'GET availability'));
}

/** One item of `POST bookings`. The server derives end times, buffers and prices. */
export interface CreateBookingItem {
  service_id: string;
  /** Specialist services only — capacity services must omit it. */
  employee_id?: string;
  /** UTC ISO instant, straight from the picked slot's `start_time`. */
  starts_at: string;
}

/** Turns one configured service from the booking draft into a `POST bookings` item. */
export function draftEntryToPayload(entry: BookingDraftEntry): CreateBookingItem {
  return {
    service_id: entry.service.id,
    // Capacity services omit employee_id entirely; specialist services take
    // it from whichever slot was tapped, which covers both a specific pick
    // and "Any specialist" (see mergeSpecialistSlots).
    ...(entry.service.requires_specialist && entry.slot.employee_id
      ? { employee_id: entry.slot.employee_id }
      : {}),
    starts_at: entry.slot.start_time,
  };
}

/**
 * The whole draft as one booking request. The backend has a single
 * `customer_note` per booking (no per-item notes — backend gap G4), so each
 * service's note becomes a "<service name>: <note>" line.
 */
export function draftToBookingRequest(entries: BookingDraftEntry[]): {
  items: CreateBookingItem[];
  customerNote?: string;
} {
  const noteLines = entries
    .filter((entry) => entry.note?.trim())
    .map((entry) => `${entry.service.name}: ${entry.note!.trim()}`);
  return {
    items: entries.map(draftEntryToPayload),
    ...(noteLines.length > 0 ? { customerNote: noteLines.join('\n') } : {}),
  };
}

// developer-guide.md §6 "Customer books" — same call for a fresh booking or a
// rebook (rebook just prefills the flow from a past booking). Up to 10 items.
// → 201 { booking }; callers read the full view model with `getBooking(id)`.
export async function createBooking(
  branchId: string,
  items: CreateBookingItem[],
  customerNote?: string,
): Promise<{ id: string }> {
  const response = await callFunction<unknown>('bookings', {
    method: 'POST',
    body: { branch_id: branchId, items, ...(customerNote ? { customer_note: customerNote } : {}) },
  });
  const { booking } = parseOrReport(createdBookingSchema, response, 'POST bookings');
  return { id: booking.id };
}

// developer-guide.md §6 "Reschedule" — customers can only move the TIME of an
// item on their own booking; changing the specialist is staff-only (a
// customer who wants someone else rebooks instead). `itemId` is the
// booking_items uuid (BookingServiceRead.id).
export async function rescheduleBookingService(
  itemId: string,
  params: { starts_at: string },
): Promise<void> {
  await callFunction<unknown>(`bookings/items/${itemId}`, {
    method: 'PATCH',
    body: { starts_at: params.starts_at },
  });
}
