import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

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
  });
}

export function useRescheduleBooking(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingServiceId,
      ...params
    }: RescheduleBookingServiceParams & { bookingServiceId: number }) =>
      rescheduleBookingService(bookingServiceId, params),
    onSuccess: (updated) => {
      queryClient.setQueryData(bookingKeys.detail(bookingId), updated);
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
