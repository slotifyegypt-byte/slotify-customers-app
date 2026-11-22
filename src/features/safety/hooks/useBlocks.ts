import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { blockBusiness, blockReviewer, getMyBlocks, unblock } from '../api/safetyApi';

export const blockKeys = { all: ['blocks'] as const };

/** The signed-in customer's blocks (chat and Profile → Blocked are signed-in screens). */
export function useMyBlocks() {
  return useQuery({ queryKey: blockKeys.all, queryFn: getMyBlocks });
}

/** Block / unblock, then refresh what blocking changes: the blocks list, reviews and chats. */
export function useBlockActions() {
  const queryClient = useQueryClient();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: blockKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['venue'] });
  };
  return {
    blockBusiness: useMutation({ mutationFn: blockBusiness, onSettled: refresh }),
    blockReviewer: useMutation({ mutationFn: blockReviewer, onSettled: refresh }),
    unblock: useMutation({ mutationFn: unblock, onSettled: refresh }),
  };
}
