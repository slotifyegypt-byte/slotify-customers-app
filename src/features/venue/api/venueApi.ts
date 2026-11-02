import { fromPostgrest } from '@/lib/api/errors';
import { supabase } from '@/lib/supabase';
import { branchToday } from '@/lib/time/branchTime';

import {
  toGalleryItem,
  toHoursWeek,
  toReview,
  toReviewStats,
  toSpecialDay,
  toTeamMember,
} from './mappers';
import type { GalleryItem, HoursDay, SpecialDay, TeamMember, VenueReview, VenueReviewStats } from './schemas';

// developer-guide.md §5 — `branchId` is the branch uuid.

// Weekly opening hours; every day 1..7 is present, empty `intervals` = closed.
export async function getStoreCalendar(branchId: string): Promise<HoursDay[]> {
  const { data, error } = await supabase
    .from('branch_hours')
    .select('day_of_week, opens_at, closes_at')
    .eq('branch_id', branchId);
  if (error) throw fromPostgrest(error);
  return toHoursWeek(data ?? []);
}

// One-off exceptions from today (in the BRANCH's timezone) onwards. Callers
// that already hold the branch detail pass its `timezone`; otherwise it is
// looked up from `branch_cards` with one small query.
export async function getStoreSpecialDays(branchId: string, timezone?: string): Promise<SpecialDay[]> {
  const zone = timezone ?? (await getBranchTimezone(branchId));
  const { data, error } = await supabase
    .from('branch_special_days')
    .select('date, is_closed, opens_at, closes_at, reason')
    .eq('branch_id', branchId)
    .gte('date', branchToday(zone))
    .order('date');
  if (error) throw fromPostgrest(error);
  return (data ?? []).map(toSpecialDay);
}

async function getBranchTimezone(branchId: string): Promise<string> {
  const { data, error } = await supabase.from('branch_cards').select('timezone').eq('id', branchId).single();
  if (error) throw fromPostgrest(error);
  return data.timezone;
}

export async function getStoreGallery(branchId: string): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('branch_photos')
    .select('id, image_path, caption, sort_order')
    .eq('branch_id', branchId)
    .order('sort_order');
  if (error) throw fromPostgrest(error);
  return (data ?? []).map(toGalleryItem).filter((item): item is GalleryItem => item !== null);
}

export async function getStoreTeam(branchId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase.rpc('get_branch_team', { p_branch_id: branchId });
  if (error) throw fromPostgrest(error);
  return (data ?? []).map(toTeamMember);
}

const DEFAULT_REVIEWS_LIMIT = 20;

export interface ReviewListParams {
  limit?: number;
  offset?: number;
}

export async function getStoreReviews(branchId: string, params: ReviewListParams = {}): Promise<VenueReview[]> {
  const limit = params.limit ?? DEFAULT_REVIEWS_LIMIT;
  const offset = params.offset ?? 0;
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, reply, replied_at, reviewer_name, created_at')
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw fromPostgrest(error);
  return (data ?? []).map(toReview);
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

// There is no stats rpc: average and total come precomputed on `branch_cards`
// and the 1-5 star breakdown is five parallel head-only count queries.
export async function getStoreReviewStats(branchId: string): Promise<VenueReviewStats> {
  const [card, ...counts] = await Promise.all([
    supabase.from('branch_cards').select('rating_avg, rating_count').eq('id', branchId).single(),
    ...STAR_VALUES.map((rating) =>
      supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('branch_id', branchId)
        .eq('rating', rating),
    ),
  ]);
  if (card.error) throw fromPostgrest(card.error);
  for (const result of counts) {
    if (result.error) throw fromPostgrest(result.error);
  }
  return toReviewStats(card.data, counts.map((result) => result.count ?? 0) as [number, number, number, number, number]);
}
