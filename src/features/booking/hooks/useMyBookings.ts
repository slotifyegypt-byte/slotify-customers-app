import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getMe } from '@/features/profile/api/profileApi';
import { profileKeys } from '@/features/profile/api/queryKeys';

import { getMyBookings } from '../api/bookingApi';
import { bookingKeys } from '../api/queryKeys';
import type { BookingStatus } from '../api/schemas';

export function useMyBookings(status?: BookingStatus) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: bookingKeys.myBookings(status),
    // The customer id comes from the cached profile so the five Activity tabs
    // share one lookup.
    queryFn: async () => {
      const me = await queryClient.ensureQueryData({ queryKey: profileKeys.me, queryFn: getMe });
      return getMyBookings(me.id, status);
    },
  });
}
