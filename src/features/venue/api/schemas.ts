// Venue Detail view models. The data now comes straight from Supabase tables
// and RPCs (developer-guide.md §5), so these are plain hand-declared types
// built by the mappers in ./mappers — there is no response validation layer.

// ── About tab — hours ───────────────────────────────────────────────────
export interface HoursInterval {
  /** Wall-clock time in the branch's timezone, as stored: "09:00:00". */
  opens_at: string;
  closes_at: string;
  /** closes_at is earlier than opens_at, so the interval runs into the next day. */
  crosses_midnight: boolean;
}

export interface HoursDay {
  /** 1 = Monday … 7 = Sunday. */
  day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Split shifts are several intervals in opening order; empty = closed. */
  intervals: HoursInterval[];
}

export interface SpecialDay {
  /** YYYY-MM-DD, branch-local. */
  date: string;
  is_closed: boolean;
  opens_at: string | null;
  closes_at: string | null;
  reason: string | null;
}

// ── Photo gallery ───────────────────────────────────────────────────────
export interface GalleryItem {
  id: string;
  imageUrl: string;
}

// ── Meet the team ───────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string | null;
  /** Built public URL, not a storage path. */
  profile_picture: string | null;
  /** The employee's job title. */
  role_name: string | null;
  bio: string | null;
  service_ids: string[];
}

// ── Reviews tab ─────────────────────────────────────────────────────────
export interface VenueReview {
  id: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  owner_reply: string | null;
  owner_reply_at: string | null;
  /** ISO instant (UTC). */
  created_at: string;
}

// Keys are the strings "1".."5", the shape ReviewsTab reads.
export type RatingDistribution = Record<'1' | '2' | '3' | '4' | '5', number>;

export interface VenueReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: RatingDistribution;
}
