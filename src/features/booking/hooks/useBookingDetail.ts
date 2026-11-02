import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { isApiError } from '@/lib/api/errors';

import { cancelBooking, getBooking, rescheduleBookingService, type RescheduleBookingServiceParams } from '../api/bookingApi';
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

export function useRescheduleBooking(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingServiceId,
      ...params
    }: RescheduleBookingServiceParams & { bookingServiceId: string }) =>
      rescheduleBookingService(bookingServiceId, params),
    // Reschedule still returns the legacy booking shape until Task 6, so the
    // detail cache can't be seeded from it — refetch instead.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
