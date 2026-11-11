import { useQuery } from '@tanstack/react-query';

import { getMyLoyaltyCards } from '../api/loyaltyApi';
import { loyaltyKeys } from '../api/queryKeys';

export function useMyLoyaltyCards() {
  return useQuery({ queryKey: loyaltyKeys.cards(), queryFn: getMyLoyaltyCards, staleTime: 30_000 });
}
