import { useQuery } from '@tanstack/react-query';

import { searchStores, type SearchParams } from '../api/exploreApi';
import { exploreKeys } from '../api/queryKeys';

export function useSearchStores(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: exploreKeys.search(params),
    queryFn: () => searchStores(params),
    enabled,
  });
}
