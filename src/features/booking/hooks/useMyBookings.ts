import { useQuery } from '@tanstack/react-query';

import { getMyBookings } from '../api/bookingApi';
import { bookingKeys } from '../api/queryKeys';
import type { BookingStatus } from '../api/schemas';

export function useMyBookings(status?: BookingStatus) {
  return useQuery({
    queryKey: bookingKeys.myBookings(status),
    queryFn: () => getMyBookings(status),
  });
}
