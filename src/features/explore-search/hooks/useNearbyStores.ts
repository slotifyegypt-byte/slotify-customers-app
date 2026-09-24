import { useQuery } from '@tanstack/react-query';

import { getNearbyStores, type NearbyParams } from '../api/exploreApi';
import { exploreKeys } from '../api/queryKeys';

export function useNearbyStores(params: NearbyParams | null) {
  return useQuery({
    queryKey: exploreKeys.nearby(params),
    queryFn: () => getNearbyStores(params!),
    enabled: params !== null,
  });
}
