import { useQuery } from '@tanstack/react-query';

import { venueKeys } from '../api/queryKeys';
import { getBranchDeals } from '../api/venueApi';

/** The branch's deals running today (needs the branch's time zone, so it waits for the store). */
export function useVenueDeals(storeId: string, timeZone: string | undefined) {
  return useQuery({
    queryKey: venueKeys.deals(storeId),
    queryFn: () => getBranchDeals(storeId, timeZone!),
    enabled: Boolean(storeId && timeZone),
  });
}
