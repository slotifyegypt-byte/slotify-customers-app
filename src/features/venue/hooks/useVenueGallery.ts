import { useQuery } from '@tanstack/react-query';

import { venueKeys } from '../api/queryKeys';
import { getStoreGallery } from '../api/venueApi';

// Kept `retry: false` so a failing gallery degrades to "hide the section"
// quickly instead of retrying, per the screen's degrade-gracefully rule.
export function useVenueGallery(storeId: string) {
  return useQuery({
    queryKey: venueKeys.gallery(storeId),
    queryFn: () => getStoreGallery(storeId),
    retry: false,
  });
}
