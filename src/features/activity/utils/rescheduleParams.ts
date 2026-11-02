import type { AvailabilityParams } from '@/features/booking/api/bookingApi';
import type { BookingRead, BookingServiceRead } from '@/features/booking/api/schemas';

/**
 * Availability query for moving one booking item: pinned to the item's
 * specialist and told to ignore the item itself (`exclude_item_id`), so its
 * current slot and the buffer around it show as free.
 */
export function rescheduleAvailabilityParams(
  booking: Pick<BookingRead, 'store_id'>,
  item: Pick<BookingServiceRead, 'id' | 'service_id' | 'employee_id'>,
  date: string,
): AvailabilityParams {
  return {
    store_id: booking.store_id,
    service_id: item.service_id,
    date,
    ...(item.employee_id ? { employee_id: item.employee_id } : {}),
    exclude_item_id: item.id,
  };
}
