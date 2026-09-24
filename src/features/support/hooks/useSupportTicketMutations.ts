import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supportKeys } from '../api/queryKeys';
import { createSupportTicket } from '../api/supportApi';

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.all });
    },
  });
}
