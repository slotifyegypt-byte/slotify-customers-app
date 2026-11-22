import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getHereNow } from '@/lib/location/hereNow';

import { bookingKeys } from '../api/queryKeys';
import { checkInHere, getMyQueueTicket } from '../api/queueApi';

/** How often the booking screen asks for the customer's place while they wait. */
export const QUEUE_POLL_MS = 10_000;

/**
 * The customer's ticket for this booking, refreshed while they are in line (the "It's your turn" push is the
 * real alert; this keeps the screen honest while it is open).
 */
export function useMyQueueTicket(bookingId: string, enabled: boolean) {
  return useQuery({
    queryKey: bookingKeys.queue(bookingId),
    queryFn: () => getMyQueueTicket(bookingId),
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'waiting' || status === 'serving' ? QUEUE_POLL_MS : false;
    },
  });
}

/** "I'm here": finds where the customer is, then checks the booking in. */
export function useCheckIn(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => checkInHere(bookingId, await getHereNow()),
    // Refresh even on failure: "already checked in" means the screen is behind.
    onSettled: () => queryClient.invalidateQueries({ queryKey: bookingKeys.queue(bookingId) }),
  });
}
