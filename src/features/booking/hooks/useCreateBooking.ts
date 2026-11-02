import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBooking, type CreateBookingItem } from '../api/bookingApi';
import { bookingKeys } from '../api/queryKeys';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, items, customerNote }: { branchId: string; items: CreateBookingItem[]; customerNote?: string }) =>
      createBooking(branchId, items, customerNote),
    // `bookings.all` covers my-bookings, details and availability (the
    // booked slots are no longer free).
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
