import { useMutation, useQueryClient } from '@tanstack/react-query';

import { joinLoyaltyProgram } from '../api/loyaltyApi';
import { loyaltyKeys } from '../api/queryKeys';

/** Adds a card from a scanned or typed join code. Resolves once the card list has the new card, so opening it never finds nothing. */
export function useJoinLoyaltyProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinLoyaltyProgram,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: loyaltyKeys.cards() }),
  });
}
