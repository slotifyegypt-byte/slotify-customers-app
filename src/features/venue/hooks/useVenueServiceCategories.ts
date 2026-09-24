import { useQuery } from '@tanstack/react-query';

import { venueKeys } from '../api/queryKeys';
import { getStoreServiceCategories } from '../api/venueApi';

export function useVenueServiceCategories(storeId: string) {
  return useQuery({
    queryKey: venueKeys.serviceCategories(storeId),
    queryFn: () => getStoreServiceCategories(storeId),
  });
}
