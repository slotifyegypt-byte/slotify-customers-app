import { useQuery } from '@tanstack/react-query';

import { getStoreDetail } from '../api/exploreApi';
import { exploreKeys } from '../api/queryKeys';

interface UseStoreDetailOptions {
  enabled?: boolean;
  latitude?: number;
  longitude?: number;
}

export function useStoreDetail(storeId: string, options?: UseStoreDetailOptions) {
  const { latitude, longitude } = options ?? {};
  const hasLocation = latitude != null && longitude != null;

  // Rounded to ~3 decimal places (~110m) for the cache key: GPS readings
  // jitter slightly between renders, and keying on the raw float would mint
  // a new cache entry (and refetch) on every trivial movement. This is
  // coarser than the precision actually sent to the backend — the request
  // itself still uses the exact coordinates — it only affects when React
  // Query treats "the same place" as a cache hit vs. a new entry.
  const locationKey = hasLocation ? `${latitude.toFixed(3)},${longitude.toFixed(3)}` : undefined;

  return useQuery({
    queryKey: exploreKeys.storeDetail(storeId, locationKey),
    queryFn: () => getStoreDetail(storeId, latitude, longitude),
    enabled: options?.enabled ?? true,
  });
}
