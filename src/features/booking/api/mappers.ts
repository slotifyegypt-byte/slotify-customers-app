import { toStore } from '@/features/explore-search/api/mappers';
import type { BranchCardRow } from '@/features/explore-search/api/mappers';
import type { Database } from '@/lib/database.types';
import { formatDate, formatDateTitle, formatHour } from '@/lib/time/branchTime';

import type { BookingRead, BookingServiceRead } from './schemas';

type Tables = Database['public']['Tables'];

// developer-guide.md §5 "My bookings", verbatim. `reviews` links to bookings
// twice (booking_id+branch_id and a second key), so the relationship must be
// named; the embed is an array holding 0 or 1 review.
export const BOOKING_SELECT =
  '*, items:booking_items(*), branch:branch_cards(*), reviews:reviews!reviews_booking_id_branch_id_fkey(id, rating)';

export type BookingItemRow = Tables['booking_items']['Row'];

export type BookingRow = Tables['bookings']['Row'] & {
  items: BookingItemRow[];
  // `branch_cards` only exposes active branches, so the embed is null for a
  // booking at a branch that was later deactivated or suspended.
  branch: BranchCardRow | null;
  reviews: { id: string; rating: number }[];
};

function toBookingService(item: BookingItemRow): BookingServiceRead {
  return {
    id: item.id,
    booking_id: item.booking_id,
    service_id: item.service_id,
    employee_id: item.employee_id,
    employee_name: item.employee_name,
    booking_start_time: item.starts_at,
    booking_end_time: item.ends_at,
    booking_status: item.status,
    total_price: item.price,
    service_name: item.service_name,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

// Stand-in for a booking whose branch is no longer readable, so history stays
// visible instead of the whole list failing.
function fallbackStore() {
  return {
    name: 'Unavailable venue', // TODO i18n
    logo: null,
    address: '',
    rating: 0,
    // The booking row carries no timezone. 'Africa/Cairo' is the
    // branches.timezone column default, used here as a last-resort guess.
    timezone: 'Africa/Cairo',
  };
}

export function toBooking(row: BookingRow, now: Date = new Date()): BookingRead {
  const store = row.branch ? toStore(row.branch) : fallbackStore();
  const items = [...row.items].sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
  const review = row.reviews[0] ?? null;

  return {
    id: row.id,
    customer_id: row.customer_id,
    store_id: row.branch_id,
    store_name: store.name,
    store_logo: store.logo,
    store_address: store.address,
    store_rating: store.rating,
    booking_status: row.status,
    // Capacity-mode services never get a specialist, so "no item has an
    // employee" is what marks a drop-off. A booking with no items at all is
    // not a drop-off.
    booking_type: items.length > 0 && items.every((item) => item.employee_id === null) ? 'drop_off' : 'appointment',
    total_price: row.total_price,
    // The booking's own currency column, not the (possibly missing) branch's.
    currency: row.currency,
    timezone: store.timezone,
    booking_date: row.starts_at,
    booking_date_title: formatDateTitle(row.starts_at, store.timezone, now),
    booking_date_str: formatDate(row.starts_at, store.timezone),
    booking_hour_str: formatHour(row.starts_at, store.timezone),
    booking_services_str: items.map((item) => item.service_name).join(', '),
    venue_available: row.branch !== null,
    has_review: review !== null,
    review_id: review?.id ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    booking_services: items.map(toBookingService),
  };
}
