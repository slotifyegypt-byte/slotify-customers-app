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

// Services offered by one branch (developer-guide.md §5), built by
// `toService` in features/venue/api/mappers. Mixed specialist/capacity per
// `requires_specialist`. `id` is the service uuid.
export interface Service {
  id: string;
  name: string;
  description: string | null;
  /** Built public URL, not a storage path. */
  image: string | null;
  duration_minutes: number;
  /** The branch's price override when set (0 counts), else the service's own price. */
  price: number;
  /** ISO 4217 code of the business — format with `formatMoney(price, currency)`. */
  currency: string;
  requires_specialist: boolean;
  /** Capacity-mode services only: how many guests can be booked at once. */
  max_concurrent_bookings: number | null;
  category: ServiceCategory | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  sort_order: number;
}

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

// §6 — specialist picker, built from a `get_branch_team` row. `rating` is
// absent: the team rpc carries no per-specialist rating.
export interface BookingEmployee {
  id: string;
  first_name: string;
  last_name: string | null;
  profile_picture: string | null;
  role_name: string | null;
  rating?: number | null;
}
