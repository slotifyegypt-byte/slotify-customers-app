import { useQuery } from '@tanstack/react-query';

import { venueKeys } from '../api/queryKeys';
import { getStoreTeam } from '../api/venueApi';

export function useVenueTeam(storeId: string) {
  return useQuery({
    queryKey: venueKeys.team(storeId),
    queryFn: () => getStoreTeam(storeId),
  });
}
