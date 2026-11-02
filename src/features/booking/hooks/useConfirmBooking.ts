import { router } from 'expo-router';
import { useState } from 'react';

import { isApiError } from '@/lib/api/errors';

import { draftToBookingRequest } from '../api/bookingApi';
import { useBookingDraftStore, type BookingDraftEntry } from '../state/bookingDraftStore';
import { getBookingErrorMessage, isSlotConflict, slotConflictMessage } from '../utils/bookingErrors';

import { useCreateBooking } from './useCreateBooking';
import { useSlotConflictRecovery } from './useSlotConflictRecovery';

// developer-guide.md §6: at most 10 items per booking.
const MAX_ITEMS = 10;

export type ConfirmOutcome =
  | { status: 'booked'; id: string }
  | {
      status: 'failed';
      message: string;
      /**
       * Set for slot conflicts / `time_in_past`: the entries found to have
       * lost their slot (already removed from the draft). Empty when the
       * culprit couldn't be pinpointed. null for every other error.
       */
      conflicting: BookingDraftEntry[] | null;
    };

/**
 * Submits a whole booking draft (BookingFlow's own service plus anything
 * saved via "+ Add Service", or VenueDetail's draft bar) and turns every
 * server answer into something the screen can show inline:
 * - slot_taken / slot_unavailable / time_in_past: availability is re-read,
 *   only the conflicting entries are dropped from the draft, others stay;
 * - customer_profile_required: the profile screen opens (the app creates the
 *   customer row at sign-in, so this should be rare) and its message shows;
 * - anything else (employee_unavailable, employee_required,
 *   service_not_offered, network…): the server's message, else `fallback`.
 * `isPending` covers the create call AND the recovery refetch, and both are
 * always settled before `confirm` resolves — a spinner can't get stuck.
 */
export function useConfirmBooking(storeId: string) {
  const createBooking = useCreateBooking();
  const recoverFromSlotConflict = useSlotConflictRecovery(storeId);
  const clearDraft = useBookingDraftStore((state) => state.clear);
  const [recovering, setRecovering] = useState(false);

  const confirm = async (entries: BookingDraftEntry[], fallback: string): Promise<ConfirmOutcome> => {
    if (entries.length > MAX_ITEMS) {
      // TODO i18n
      return { status: 'failed', message: `You can book up to ${MAX_ITEMS} services at once.`, conflicting: null };
    }
    try {
      const { items, customerNote } = draftToBookingRequest(entries);
      const { id } = await createBooking.mutateAsync({ branchId: storeId, items, customerNote });
      clearDraft(storeId);
      return { status: 'booked', id };
    } catch (error) {
      if (isSlotConflict(error) || isApiError(error, 'time_in_past')) {
        setRecovering(true);
        try {
          const conflicting = await recoverFromSlotConflict(entries);
          return { status: 'failed', message: slotConflictMessage(error, conflicting), conflicting };
        } catch {
          return { status: 'failed', message: slotConflictMessage(error, []), conflicting: [] };
        } finally {
          setRecovering(false);
        }
      }
      if (isApiError(error, 'customer_profile_required')) {
        router.push('/(tabs)/profile/edit');
      }
      return { status: 'failed', message: getBookingErrorMessage(error, fallback), conflicting: null };
    }
  };

  return { confirm, isPending: createBooking.isPending || recovering };
}
