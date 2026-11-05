import { z } from 'zod';

// Mirrors the `booking_status` enum (database.types.ts). `no_show` is set by
// staff after a missed appointment; the customer app only ever displays it.
export const bookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
]);
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
  /** Clean-up time after the service; the specialist stays blocked for it (server exclusion constraint). */
  buffer_minutes: number;
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

// developer-guide.md §6 — `GET availability?…&stream=0` returns one JSON
// document: the NDJSON `meta` frame, the `employee` frames (specialist
// services) and the capacity `slots`. Raw shape, validated with parseOrReport
// and mapped to `AvailabilityResponse` by `toAvailability` in ./mappers.
// The server only returns FREE slots, starting after "now".
const rawAvailabilitySlotSchema = z.object({
  starts_at: z.string(),
  ends_at: z.string(),
  /** Capacity services only. */
  remaining: z.number().optional(),
});

export const availabilityDocSchema = z.object({
  meta: z.object({
    branch_id: z.string(),
    service_id: z.string(),
    date: z.string(),
    timezone: z.string(),
    duration_minutes: z.number(),
    booking_mode: z.enum(['specialist', 'capacity']),
    step_minutes: z.number(),
    /** numeric(12,2) as a string, e.g. "300.00". */
    price: z.union([z.string(), z.number()]),
  }),
  employees: z.array(
    z.object({
      employee_id: z.string(),
      name: z.string(),
      slots: z.array(rawAvailabilitySlotSchema),
    }),
  ),
  slots: z.array(rawAvailabilitySlotSchema),
});
export type AvailabilityDoc = z.infer<typeof availabilityDocSchema>;

/** One free slot. Times are UTC ISO instants from the server. */
export interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  /** The specialist this slot belongs to; null for capacity services. */
  employee_id: string | null;
  employee_name: string | null;
  /** Capacity services only: places left at this time. */
  capacity_remaining: number | null;
  /** `start_time` formatted in the branch `timezone`, e.g. "10:00 AM". */
  time_slot_str: string;
}

// `booking_mode` decides which of employees/slots is populated: specialist ->
// per-employee `available_slots`, capacity -> flat `slots`. Empty lists are a
// normal "no free slots" result, not an error.
export interface AvailabilityResponse {
  store_id: string;
  service_id: string;
  /** Branch-local "YYYY-MM-DD". */
  date: string;
  /** Branch IANA timezone. */
  timezone: string;
  service_duration_minutes: number;
  step_minutes: number;
  price: number;
  booking_mode: 'specialist' | 'capacity';
  employees: { employee_id: string; employee_name: string; available_slots: AvailabilitySlot[] }[];
  slots: AvailabilitySlot[];
}

// Response of `POST bookings` (201) — only the id is read; callers refetch the
// full booking with `getBooking(id)`.
export const createdBookingSchema = z.object({ booking: z.object({ id: z.string() }) });

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
