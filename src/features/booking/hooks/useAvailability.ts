import { useQuery } from '@tanstack/react-query';

import { getAvailability, type AvailabilityParams } from '../api/bookingApi';
import { bookingKeys } from '../api/queryKeys';

export function useAvailability(params: AvailabilityParams | null) {
  return useQuery({
    queryKey: bookingKeys.availability(params),
    queryFn: () => getAvailability(params!),
    enabled: params !== null,
  });
}
