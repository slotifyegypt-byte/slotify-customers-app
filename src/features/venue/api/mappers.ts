import type { Service, ServiceCategory } from '@/features/booking/api/schemas';
import type { Database } from '@/lib/database.types';
import { publicUrl } from '@/lib/storage';

import { crossesMidnight } from '../utils/hours';

import type {
  GalleryItem,
  HoursDay,
  HoursInterval,
  RatingDistribution,
  SpecialDay,
  TeamMember,
  VenueReview,
  VenueReviewStats,
} from './schemas';

type Tables = Database['public']['Tables'];
type Functions = Database['public']['Functions'];

export type HoursRow = Pick<Tables['branch_hours']['Row'], 'day_of_week' | 'opens_at' | 'closes_at'>;
export type SpecialDayRow = Pick<
  Tables['branch_special_days']['Row'],
  'date' | 'is_closed' | 'opens_at' | 'closes_at' | 'reason'
>;
export type PhotoRow = Pick<Tables['branch_photos']['Row'], 'id' | 'image_path'>;
export type TeamRow = Functions['get_branch_team']['Returns'][number];
export type ReviewRow = Pick<
  Tables['reviews']['Row'],
  'id' | 'rating' | 'comment' | 'reply' | 'replied_at' | 'reviewer_name' | 'created_at'
>;

/** A `branch_services` row with the nested service the services query asks for. */
export interface BranchServiceRow {
  price: number | null;
  is_active: boolean;
  service: {
    id: string;
    name: string;
    description: string | null;
    image_path: string | null;
    duration_minutes: number;
    buffer_minutes: number;
    booking_mode: Database['public']['Enums']['booking_mode'];
    capacity: number | null;
    price: number;
    sort_order: number;
    archived_at: string | null;
    category: { id: string; name: string; sort_order: number } | null;
  } | null;
}

const DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 7] as const;

// Always returns all seven days so the About tab can show "Closed" for a day
// with no rows without knowing which days exist.
export function toHoursWeek(rows: HoursRow[]): HoursDay[] {
  return DAYS_OF_WEEK.map((day_of_week) => {
    const intervals: HoursInterval[] = rows
      .filter((row) => row.day_of_week === day_of_week)
      .sort((a, b) => a.opens_at.localeCompare(b.opens_at))
      .map((row) => ({
        opens_at: row.opens_at,
        closes_at: row.closes_at,
        crosses_midnight: crossesMidnight(row.opens_at, row.closes_at),
      }));
    return { day_of_week, intervals };
  });
}

export function toSpecialDay(row: SpecialDayRow): SpecialDay {
  return {
    date: row.date,
    is_closed: row.is_closed,
    opens_at: row.opens_at,
    closes_at: row.closes_at,
    reason: row.reason,
  };
}

export function toGalleryItem(row: PhotoRow): GalleryItem | null {
  const imageUrl = publicUrl(row.image_path);
  return imageUrl ? { id: row.id, imageUrl } : null;
}

// The generated rpc types say these are non-null strings, but employees
// without a photo/bio/last name come back null at runtime.
export function toTeamMember(row: TeamRow): TeamMember {
  return {
    id: row.employee_id,
    first_name: row.first_name,
    last_name: row.last_name ?? null,
    profile_picture: publicUrl(row.avatar_path),
    role_name: row.job_title ?? null,
    bio: row.bio ?? null,
    service_ids: row.service_ids ?? [],
  };
}

// Returns null for rows the customer must not see: an archived service or one
// the branch has switched off. RLS already hides both from customers, but a
// signed-in partner user also passes the staff policies, so filter here too.
export function toService(row: BranchServiceRow, currency: string): Service | null {
  const { service } = row;
  if (!service || service.archived_at != null || !row.is_active) return null;

  const category: ServiceCategory | null = service.category
    ? {
        id: service.category.id,
        name: service.category.name,
        sort_order: service.category.sort_order,
      }
    : null;

  return {
    id: service.id,
    name: service.name,
    description: service.description,
    image: publicUrl(service.image_path),
    duration_minutes: service.duration_minutes,
    buffer_minutes: service.buffer_minutes,
    // `??`, not `||`: a branch price of 0 is a real override.
    price: row.price ?? service.price,
    currency,
    requires_specialist: service.booking_mode === 'specialist',
    max_concurrent_bookings: service.booking_mode === 'capacity' ? service.capacity : null,
    category,
  };
}

// Uncategorised services last; otherwise the owner's category order, then the
// owner's service order, then alphabetical.
export function compareBranchServices(a: BranchServiceRow, b: BranchServiceRow): number {
  const rank = (row: BranchServiceRow) => row.service?.category?.sort_order ?? Number.POSITIVE_INFINITY;
  const [rankA, rankB] = [rank(a), rank(b)];
  if (rankA !== rankB) return rankA < rankB ? -1 : 1;
  return (
    (a.service?.sort_order ?? 0) - (b.service?.sort_order ?? 0) ||
    (a.service?.name ?? '').localeCompare(b.service?.name ?? '')
  );
}

export function toReview(row: ReviewRow): VenueReview {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    customer_name: row.reviewer_name,
    owner_reply: row.reply,
    owner_reply_at: row.replied_at,
    created_at: row.created_at,
  };
}

type ReviewStatsRow = Database['public']['Functions']['get_review_stats']['Returns'][number];

const STAR_KEYS = ['1', '2', '3', '4', '5'] as const;

// `rating_distribution` is jsonb, so it is read defensively and zero-filled.
export function toReviewStats(row: ReviewStatsRow): VenueReviewStats {
  const raw =
    row.rating_distribution != null &&
    typeof row.rating_distribution === 'object' &&
    !Array.isArray(row.rating_distribution)
      ? row.rating_distribution
      : {};
  const rating_distribution = Object.fromEntries(
    STAR_KEYS.map((key) => {
      const value = raw[key];
      return [key, typeof value === 'number' ? value : 0];
    }),
  ) as RatingDistribution;
  return {
    average_rating: row.average_rating,
    total_reviews: row.total_reviews,
    rating_distribution,
  };
}
