import { useQuery } from '@tanstack/react-query';

import { getStoreTeam } from '../api/teamApi';

export function useStoreTeam(storeId: string | undefined) {
  return useQuery({
    queryKey: ['activity', 'store-team', storeId ?? ''],
    queryFn: () => getStoreTeam(storeId!),
    enabled: Boolean(storeId),
    staleTime: 5 * 60 * 1000,
  });
}
