import { z } from 'zod';

import { compareBranchServices, toService } from '@/features/venue/api/mappers';
import { getStoreTeam } from '@/features/venue/api/venueApi';
import { apiClient } from '@/lib/api/client';
import { fromPostgrest } from '@/lib/api/errors';
import { validateResponse } from '@/lib/api/zodFetch';
import { supabase } from '@/lib/supabase';

import type { BookingDraftEntry } from '../state/bookingDraftStore';
import { toBookingTimestamp } from '../utils/time';

import {
  availabilityResponseSchema,
  bookingReadSchema,
  type BookingEmployee,
  type BookingStatus,
  type Service,
} from './schemas';

// customer-app-api-map.md §8
export async function getMyBookings(status?: BookingStatus) {
  const response = await apiClient.get('/bookings/my-bookings', { params: status ? { status } : undefined });
  return validateResponse(z.array(bookingReadSchema), response, 'GET /bookings/my-bookings');
}

// §9
export async function getBooking(bookingId: string) {
  const response = await apiClient.get(`/bookings/${bookingId}`);
  return validateResponse(bookingReadSchema, response, `GET /bookings/${bookingId}`);
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const response = await apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
  return validateResponse(bookingReadSchema, response, `POST /bookings/${bookingId}/cancel`);
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
        'price, is_active, service:services(id, name, description, image_path, duration_minutes, booking_mode, capacity, price, sort_order, archived_at, category:service_categories(id, name, sort_order))',
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
export async function getStoreEmployeesForService(branchId: string, serviceId: string): Promise<BookingEmployee[]> {
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
  date: string; // YYYY-MM-DD
  employee_id?: string;
}

// §6 — response shape branches on `booking_mode`.
export async function getAvailability(params: AvailabilityParams) {
  const response = await apiClient.get('/availability', { params });
  return validateResponse(availabilityResponseSchema, response, 'GET /availability');
}

export interface CreateBookingServicePayload {
  service_id: string;
  employee_id?: string;
  booking_start_time: string;
  booking_end_time: string;
  // VERIFIED against live /openapi.json (2026-09-20): BookingServiceCreate
  // now accepts an optional note.
  note?: string;
}

/** Turns one configured service from the multi-service booking draft into its API payload shape. */
export function draftEntryToPayload(entry: BookingDraftEntry): CreateBookingServicePayload {
  return {
    service_id: entry.service.id,
    // Capacity-mode services must omit employee_id entirely (§0.2);
    // specialist-mode resolves it from whichever slot was tapped, which
    // covers both a specific pick and "Any specialist".
    ...(entry.service.requires_specialist && entry.slot.employee_id ? { employee_id: entry.slot.employee_id } : {}),
    booking_start_time: toBookingTimestamp(entry.slot.start_time),
    booking_end_time: toBookingTimestamp(entry.slot.end_time),
    ...(entry.note ? { note: entry.note } : {}),
  };
}

// §6/§7 — same call for a fresh booking or a "rebook" (rebook just prefills
// this from a past booking; there is no dedicated rebook endpoint).
export async function createBooking(storeId: string, bookingServices: CreateBookingServicePayload[]) {
  // Trailing slash is load-bearing: the backend 307-redirects the
  // slash-less path, and that redirect's Location header is (buggily)
  // `http://`, not `https://` — iOS/Android both block following it, so
  // the bare path silently fails on-device. Calling the canonical
  // slash-terminated path avoids the redirect entirely.
  const response = await apiClient.post('/bookings/', {
    store_id: storeId,
    booking_services: bookingServices,
  });
  return validateResponse(bookingReadSchema, response, 'POST /bookings/');
}

export interface RescheduleBookingServiceParams {
  booking_start_time: string;
  booking_end_time: string;
}

// New endpoint — VERIFIED against live /openapi.json + response shapes
// (2026-09-20): PUT /bookings/services/{booking_service_id}/reschedule/my-booking.
// `booking_service_id` is the booking SERVICE row's own integer `id`
// (BookingServiceRead.id), not the parent booking's UUID `id`. Time-only —
// it keeps whichever specialist is already assigned, so there's no
// employee_id here; swapping specialists is a rebook (see
// RebookSheetScreen), not a reschedule. The path already ends in the static
// `/my-booking` segment, so unlike `POST /bookings/` there's no slash-less
// redirect to dodge here (same as the `PUT /reviews/{id}` precedent).
export async function rescheduleBookingService(bookingServiceId: number, params: RescheduleBookingServiceParams) {
  const response = await apiClient.put(`/bookings/services/${bookingServiceId}/reschedule/my-booking`, params);
  return validateResponse(
    bookingReadSchema,
    response,
    `PUT /bookings/services/${bookingServiceId}/reschedule/my-booking`,
  );
}
