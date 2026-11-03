import type { VenueReview } from '@/features/venue/api/schemas';

/** One of the signed-in customer's own reviews, as the My Reviews list shows it. */
export interface CustomerReview extends VenueReview {
  /** The reviewed branch (the app calls branches "stores"). */
  store_id: string;
  /** The booking this review is for — a review always belongs to exactly one. */
  booking_id: string;
  /** Branch display name; null when the branch is no longer active/readable. */
  store_name: string | null;
  /** Branch IANA timezone for showing the review date; null when the branch is unavailable. */
  timezone: string | null;
}

export interface CreateReviewPayload {
  booking_id: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}
