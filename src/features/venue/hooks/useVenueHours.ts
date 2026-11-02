import { useQuery } from '@tanstack/react-query';

import { venueKeys } from '../api/queryKeys';
import { getStoreCalendar, getStoreSpecialDays } from '../api/venueApi';

// About tab hours = weekly calendar + one-off exceptions, always fetched
// together since the UI renders them as a single hours block. `timezone` is the
// branch's, from the store detail the screen has already loaded (undefined
// until it arrives), so "upcoming" exceptions count from the branch's today.
export function useVenueHours(storeId: string, timezone: string | undefined) {
  const calendar = useQuery({
    queryKey: venueKeys.calendar(storeId),
    queryFn: () => getStoreCalendar(storeId),
  });
  const specialDays = useQuery({
    queryKey: venueKeys.specialDays(storeId, timezone),
    queryFn: () => getStoreSpecialDays(storeId, timezone),
    // Waits for the store detail rather than paying for a timezone lookup.
    enabled: timezone !== undefined,
  });

  return { calendar, specialDays };
}
