import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { isApiError } from '@/lib/api/errors';

import { cancelBooking, getBooking, rescheduleBookingService } from '../api/bookingApi';
import { bookingKeys } from '../api/queryKeys';

export function useBookingDetail(bookingId: string) {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => getBooking(bookingId),
  });
}

export function useCancelBooking(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => cancelBooking(bookingId, reason),
    onSuccess: (updated) => {
      queryClient.setQueryData(bookingKeys.detail(bookingId), updated);
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    // The booking changed under us (e.g. already cancelled) — refresh what
    // every screen shows rather than leaving stale statuses around.
    onError: (error) => {
      if (isApiError(error, 'invalid_transition')) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      }
    },
  });
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, starts_at }: { itemId: string; starts_at: string }) =>
      rescheduleBookingService(itemId, { starts_at }),
    // Refetch this booking, the lists and availability rather than mapping
    // the function's response — getBooking owns the view model.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
