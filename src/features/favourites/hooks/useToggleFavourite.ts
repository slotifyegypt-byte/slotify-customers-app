import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addFavourite, checkFavourite, removeFavourite } from '../api/favouritesApi';
import { favouriteKeys } from '../api/queryKeys';
import type { FavouriteCheck } from '../api/schemas';

export function useFavouriteCheck(storeId: string) {
  return useQuery({
    queryKey: favouriteKeys.check(storeId),
    queryFn: () => checkFavourite(storeId),
  });
}

export function useToggleFavourite(storeId: string) {
  const queryClient = useQueryClient();
  const checkKey = favouriteKeys.check(storeId);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: checkKey });
    queryClient.invalidateQueries({ queryKey: favouriteKeys.all });
  };

  // Optimistically flips the heart the instant it's tapped rather than
  // waiting on the round trip — without this, a slow network made the
  // button look unresponsive/broken even when the request eventually
  // succeeded. Rolls back to the pre-tap value on failure, and settles by
  // invalidating either way so the server's own answer always wins.
  const setOptimistic = async (isFavourite: boolean) => {
    await queryClient.cancelQueries({ queryKey: checkKey });
    const previous = queryClient.getQueryData<FavouriteCheck>(checkKey);
    queryClient.setQueryData<FavouriteCheck>(checkKey, { is_favourite: isFavourite });
    return { previous };
  };

  const rollback = (_error: unknown, _vars: void, context: { previous: FavouriteCheck | undefined } | undefined) => {
    if (context?.previous) {
      queryClient.setQueryData(checkKey, context.previous);
    }
  };

  const add = useMutation({
    mutationFn: () => addFavourite(storeId),
    onMutate: () => setOptimistic(true),
    onError: rollback,
    onSettled: invalidate,
  });
  const remove = useMutation({
    mutationFn: () => removeFavourite(storeId),
    onMutate: () => setOptimistic(false),
    onError: rollback,
    onSettled: invalidate,
  });

  return { add, remove };
}
