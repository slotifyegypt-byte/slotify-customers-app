import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { getAvailability } from '../api/bookingApi';
import { bookingKeys } from '../api/queryKeys';
import type { AvailabilityResponse } from '../api/schemas';
import { useBookingDraftStore, type BookingDraftEntry } from '../state/bookingDraftStore';
import { availabilityParamsFor, findConflictingEntries } from '../utils/draftConflicts';

/**
 * Handles a `slot_taken` / `slot_unavailable` / `time_in_past` on create:
 * re-reads availability for every service in the attempted booking (which
 * also refreshes any grid on screen), finds the entries whose picked slot is
 * gone, drops ONLY those from the draft and returns them so the caller can
 * clear its own selection and explain. Other entries stay as they were.
 * Never throws — a failed refetch just means that entry isn't blamed.
 */
export async function recoverFromSlotConflict(
  queryClient: QueryClient,
  storeId: string,
  entries: BookingDraftEntry[],
): Promise<BookingDraftEntry[]> {
  // Every cached grid may be stale now. Mark them without refetching here;
  // the fetches below refresh the ones this booking used.
  await queryClient.invalidateQueries({
    queryKey: bookingKeys.availabilityAll(),
    refetchType: 'none',
  });

  const results = await Promise.allSettled(
    entries.map((entry) => {
      const params = availabilityParamsFor(storeId, entry);
      return queryClient.fetchQuery({
        queryKey: bookingKeys.availability(params),
        queryFn: () => getAvailability(params),
      });
    }),
  );

  const fresh: Record<string, AvailabilityResponse | undefined> = {};
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') fresh[entries[i].service.id] = result.value;
  });

  const conflicting = findConflictingEntries(entries, fresh);
  useBookingDraftStore.getState().removeEntries(
    storeId,
    conflicting.map((entry) => entry.service.id),
  );
  return conflicting;
}

export function useSlotConflictRecovery(storeId: string) {
  const queryClient = useQueryClient();
  return useCallback(
    (entries: BookingDraftEntry[]) => recoverFromSlotConflict(queryClient, storeId, entries),
    [queryClient, storeId],
  );
}
