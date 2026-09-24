import { z } from 'zod';

// customer-app-api-map.md §8/§9 — statuses actually queried/displayed by the app.
export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled']);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

// §6 "Sample — create booking" response shapes (both specialist and capacity mode
// share this — capacity mode simply has `employee_id: null` throughout).
// `note` — VERIFIED against live /openapi.json + response shapes (2026-09-20):
// BookingServiceRead now returns the note back too, nullable rather than
// always a string.
export const bookingServiceReadSchema = z.object({
  id: z.number(),
  booking_id: z.string(),
  service_id: z.string(),
  employee_id: z.string().nullable(),
  booking_start_time: z.string(),
  booking_end_time: z.string(),
  booking_status: bookingStatusSchema,
  total_price: z.number(),
  service_name: z.string(),
  service_image: z.string().nullable(),
  note: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});
export type BookingServiceRead = z.infer<typeof bookingServiceReadSchema>;

// `booking_type` — VERIFIED against live /openapi.json + response shapes
// (2026-09-20): BookingRead now returns a server-computed
// "appointment" | "drop_off" field, replacing the client's old
// every-service-has-no-employee_id inference (see git blame on
// isOrderBooking/isCapacityBooking) with real data.
export const bookingReadSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  store_id: z.string(),
  store_name: z.string(),
  store_logo: z.string().nullable(),
  store_address: z.string(),
  store_rating: z.number(),
  booking_status: bookingStatusSchema,
  booking_type: z.enum(['appointment', 'drop_off']),
  total_price: z.number(),
  booking_date: z.string(),
  booking_date_title: z.string(),
  booking_date_str: z.string(),
  booking_hour_str: z.string(),
  booking_services_str: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  booking_services: z.array(bookingServiceReadSchema),
});
export type BookingRead = z.infer<typeof bookingReadSchema>;

// §5 — services list, mixed specialist/capacity per Service.requires_specialist (§0).
export const serviceSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category_id: z.string().nullable(),
  service_image: z.string().nullable(),
  duration_minutes: z.number(),
  price: z.number(),
  price_currency: z.string(),
  price_symbol: z.string(),
  requires_specialist: z.boolean(),
  max_concurrent_bookings: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});
export type Service = z.infer<typeof serviceSchema>;

// §6 — GET /availability. `booking_mode` decides which of employees/slots is populated.
export const availabilitySlotSchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
  employee_id: z.string().nullable(),
  employee_name: z.string().nullable(),
  capacity_total: z.number().nullable(),
  capacity_booked: z.number().nullable(),
  capacity_remaining: z.number().nullable(),
  is_available: z.boolean(),
  time_slot_str: z.string(),
});
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;

export const availabilityEmployeeSchema = z.object({
  employee_id: z.string(),
  employee_name: z.string(),
  service_id: z.string(),
  available_slots: z.array(availabilitySlotSchema),
});

export const availabilityResponseSchema = z.object({
  store_id: z.string(),
  service_id: z.string(),
  date: z.string(),
  service_duration_minutes: z.number(),
  booking_mode: z.enum(['specialist', 'capacity']),
  employees: z.array(availabilityEmployeeSchema),
  slots: z.array(availabilitySlotSchema),
});
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;

// §6 — specialist picker. `rating` is optional/nullable: the mockups show a
// star rating per specialist, but not every backend deploy of this endpoint
// populates it — treat it as absent rather than failing validation.
export const bookingEmployeeSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string().nullable(),
  profile_picture: z.string().nullable(),
  role_name: z.string().nullable(),
  rating: z.number().nullable().optional(),
});
export type BookingEmployee = z.infer<typeof bookingEmployeeSchema>;

// GET /stores/{store_id}/services/{service_id}/employees — VERIFIED against
// a live response (2026-09-20): unlike the doc's assumed shape (an array of
// full employee objects, which `bookingEmployeeSchema` above was modeled on
// with no real sample to check against), this endpoint actually returns just
// bare employee ids. Display info (name/photo/role) comes from the store's
// team roster instead — see getStoreEmployeesForService in bookingApi.ts,
// which cross-references the two.
export const serviceEmployeeIdsSchema = z.object({
  service_id: z.string(),
  employee_ids: z.array(z.string()),
});
