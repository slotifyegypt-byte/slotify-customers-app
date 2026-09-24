import { useQuery } from '@tanstack/react-query';

import { venueKeys } from '../api/queryKeys';
import { getStoreCalendar, getStoreSpecialDays } from '../api/venueApi';

// About tab hours = weekly calendar + one-off exceptions, always fetched
// together since the UI renders them as a single hours block.
export function useVenueHours(storeId: string) {
  const calendar = useQuery({
    queryKey: venueKeys.calendar(storeId),
    queryFn: () => getStoreCalendar(storeId),
  });
  const specialDays = useQuery({
    queryKey: venueKeys.specialDays(storeId),
    queryFn: () => getStoreSpecialDays(storeId),
  });

  return { calendar, specialDays };
}
