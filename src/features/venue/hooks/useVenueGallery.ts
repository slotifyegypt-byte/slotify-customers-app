import { useQuery } from '@tanstack/react-query';

import { venueKeys } from '../api/queryKeys';
import { getStoreGallery } from '../api/venueApi';

// The gallery endpoint's item shape was never verified against a populated
// response (every reachable seed store returns `[]`) — kept `retry: false`
// so a genuinely broken/removed route degrades to "hide the section"
// quickly instead of retrying, per the screen's degrade-gracefully rule.
export function useVenueGallery(storeId: string) {
  return useQuery({
    queryKey: venueKeys.gallery(storeId),
    queryFn: () => getStoreGallery(storeId),
    retry: false,
  });
}
