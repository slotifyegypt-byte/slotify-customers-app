import { toStore } from '@/features/explore-search/api/mappers';
import type { BranchCardRow } from '@/features/explore-search/api/mappers';
import { toReview, type ReviewRow } from '@/features/venue/api/mappers';
import type { VenueReview } from '@/features/venue/api/schemas';
import { ApiError, fromPostgrest } from '@/lib/api/errors';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

import type { CreateReviewPayload, CustomerReview, UpdateReviewPayload } from './schemas';

const REVIEW_COLUMNS = 'id, rating, comment, reply, replied_at, reviewer_name, created_at';

type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

// developer-guide.md §5 "Review" — completed bookings only, once per booking.
// The generated Insert type lists branch_id/customer_id as required, but the
// `reviews_before_insert` trigger overwrites both from the booking, so only
// the three fields the guide names are sent. Errors: `23505` (already
// reviewed) -> duplicate; `42501` (booking not completed or not yours) -> forbidden.
export async function createReview(payload: CreateReviewPayload): Promise<VenueReview> {
  const row = {
    booking_id: payload.booking_id,
    rating: payload.rating,
    ...(payload.comment !== undefined ? { comment: payload.comment } : {}),
  };
  const { data, error } = await supabase
    .from('reviews')
    .insert(row as ReviewInsert)
    .select(REVIEW_COLUMNS)
    .single();
  if (error) throw fromPostgrest(error);
  return toReview(data);
}

// RLS hides rows that aren't the customer's own, so such an update matches
// nothing and succeeds with zero rows — surface that as forbidden.
export async function updateReview(reviewId: string, payload: UpdateReviewPayload): Promise<VenueReview> {
  const { data, error } = await supabase
    .from('reviews')
    .update(payload)
    .eq('id', reviewId)
    .select(REVIEW_COLUMNS);
  if (error) throw fromPostgrest(error);
  if (!data?.length) throw new ApiError('forbidden', 403, 'review not updated');
  return toReview(data[0]);
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { data, error } = await supabase.from('reviews').delete().eq('id', reviewId).select('id');
  if (error) throw fromPostgrest(error);
  if (!data?.length) throw new ApiError('forbidden', 403, 'review not deleted');
}

type CustomerReviewRow = ReviewRow & { branch_id: string; booking_id: string };

// `authenticated` has no SELECT privilege on `reviews.customer_id` (reviews are
// public and the column is deliberately hidden), so reviews can't be filtered
// on it. Per the backend, customers find their own reviews through their
// bookings: the bookings embed carries the (at most one) review per booking,
// `!inner` drops bookings without one. `customerId` filters bookings so a
// signed-in staff user (who can also read other customers' bookings) only
// sees their own customer reviews.
const CUSTOMER_REVIEWS_SELECT = `id, reviews:reviews!reviews_booking_id_branch_id_fkey!inner(${REVIEW_COLUMNS}, branch_id, booking_id)`;

// `reviews` has no foreign key to `branches`/`branch_cards` (only to
// `bookings`), so the branch cards are read in a second query rather than
// embedded. A branch that was deactivated has no card: its reviews stay
// visible with `store_name: null` for the screen to fall back on.
export async function getCustomerReviews(customerId: string): Promise<CustomerReview[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(CUSTOMER_REVIEWS_SELECT)
    .eq('customer_id', customerId);
  if (error) throw fromPostgrest(error);
  const rows = ((data ?? []) as unknown as { reviews: CustomerReviewRow[] }[])
    .flatMap((booking) => booking.reviews)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (rows.length === 0) return [];

  const branchIds = [...new Set(rows.map((row) => row.branch_id))];
  const cards = await supabase.from('branch_cards').select('*').in('id', branchIds);
  if (cards.error) throw fromPostgrest(cards.error);
  const stores = new Map(((cards.data ?? []) as BranchCardRow[]).map((card) => [card.id, toStore(card)]));

  return rows.map((row) => ({
    ...toReview(row),
    store_id: row.branch_id,
    booking_id: row.booking_id,
    store_name: stores.get(row.branch_id)?.name ?? null,
    timezone: stores.get(row.branch_id)?.timezone ?? null,
  }));
}
