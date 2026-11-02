import { z } from 'zod';

// Mirrors the `booking_status` enum (database.types.ts). `no_show` is set by
// staff after a missed appointment; the customer app only ever displays it.
export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

// One `booking_items` row. `id` is the item's uuid (what reschedule targets).
export interface BookingServiceRead {
  id: string;
  booking_id: string;
  service_id: string;
  employee_id: string | null;
  /** Snapshot of the specialist's name taken when the booking was made. */
  employee_name: string | null;
  /** UTC ISO instants — format with the booking's `timezone`. */
  booking_start_time: string;
  booking_end_time: string;
  booking_status: BookingStatus;
  total_price: number;
  service_name: string;
  created_at: string;
  updated_at: string | null;
}

// A customer's booking (developer-guide.md §5 "My bookings"), built by
// `toBooking` in ./mappers. The `*_title/_str/_hour_str` fields are computed
// client-side in the branch's timezone.
export interface BookingRead {
  id: string;
  customer_id: string;
  store_id: string;
  store_name: string;
  store_logo: string | null;
  store_address: string;
  store_rating: number;
  booking_status: BookingStatus;
  /** 'drop_off' when no item has a specialist (capacity mode), else 'appointment'. */
  booking_type: 'appointment' | 'drop_off';
  total_price: number;
  /** ISO 4217 code — format with `formatMoney(total_price, currency)`. */
  currency: string;
  /** Branch IANA timezone, e.g. "Africa/Cairo". */
  timezone: string;
  /** `starts_at`, UTC ISO. */
  booking_date: string;
  booking_date_title: string;
  booking_date_str: string;
  booking_hour_str: string;
  booking_services_str: string;
  /** False when the booking's branch is no longer active/readable (store_* fields are placeholders). */
  venue_available: boolean;
  /** Whether the customer has already reviewed this booking. */
  has_review: boolean;
  /** The existing review's id (for edit flows), else null. */
  review_id: string | null;
  created_at: string;
  updated_at: string | null;
  booking_services: BookingServiceRead[];
}

// ─── Legacy FastAPI booking shape — removed in Task 6 ───────────────────────
// Still returned by `createBooking` / `rescheduleBookingService`, which keep
// talking to the old axios API until Task 6 migrates them. Nothing that reads
// bookings (`getMyBookings` / `getBooking`) may use these.
export const legacyBookingServiceReadSchema = z.object({
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

export const legacyBookingReadSchema = z.object({
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
  booking_services: z.array(legacyBookingServiceReadSchema),
});
export type LegacyBookingRead = z.infer<typeof legacyBookingReadSchema>;

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
