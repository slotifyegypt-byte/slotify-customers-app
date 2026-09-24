import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBooking, type CreateBookingServicePayload } from '../api/bookingApi';
import { bookingKeys } from '../api/queryKeys';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, services }: { storeId: string; services: CreateBookingServicePayload[] }) =>
      createBooking(storeId, services),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
