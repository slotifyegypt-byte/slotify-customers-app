import { useQuery } from '@tanstack/react-query';

import { getSearchPromoted } from '../api/exploreApi';
import { exploreKeys } from '../api/queryKeys';

/** Branches in the search page's promoted section (paid placements). A failure just hides the section. */
export function useSearchPromoted() {
  return useQuery({
    queryKey: exploreKeys.promoted(),
    queryFn: () => getSearchPromoted(),
    staleTime: 5 * 60_000,
  });
}
