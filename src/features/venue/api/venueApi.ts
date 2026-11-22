import { fromPostgrest } from '@/lib/api/errors';
import { publicUrl } from '@/lib/storage';
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
import type {
  GalleryItem,
  HoursDay,
  SpecialDay,
  TeamMember,
  VenueReview,
  VenueReviewStats,
} from './schemas';

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
export async function getStoreSpecialDays(
  branchId: string,
  timezone?: string,
): Promise<SpecialDay[]> {
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
  const { data, error } = await supabase
    .from('branch_cards')
    .select('timezone')
    .eq('id', branchId)
    .single();
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

export async function getStoreReviews(
  branchId: string,
  params: ReviewListParams = {},
): Promise<VenueReview[]> {
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

// One rpc call: average, total and the zero-filled 1-5 breakdown. An unknown or
// inactive branch raises PT404 `branch_not_found`.
export async function getStoreReviewStats(branchId: string): Promise<VenueReviewStats> {
  const { data, error } = await supabase
    .rpc('get_review_stats', { p_branch_id: branchId })
    .single();
  if (error) throw fromPostgrest(error);
  return toReviewStats(data);
}

export interface BranchDeal {
  id: string;
  title: string;
  description: string | null;
  photo: string | null;
  originalPrice: number | null;
  offerPrice: number | null;
  discountPercentage: number | null;
  serviceId: string | null;
  endsOn: string;
}

// The branch's own deals running today (its page shows them whether or not they are promoted on the home screen).
// RLS already limits customers to running deals at live branches; the dates are repeated here in the branch's time
// zone because a login that is also partner staff can read every deal of its business.
export async function getBranchDeals(branchId: string, timeZone: string): Promise<BranchDeal[]> {
  const today = branchToday(timeZone);
  const { data, error } = await supabase
    .from('offers')
    .select('id, title, description, image_path, original_price, offer_price, service_id, ends_on')
    .eq('branch_id', branchId)
    .eq('is_active', true)
    .lte('starts_on', today)
    .gte('ends_on', today)
    .order('ends_on');
  if (error) throw fromPostgrest(error);
  return (data ?? []).map((row) => {
    const original = row.original_price == null ? null : Number(row.original_price);
    const offer = row.offer_price == null ? null : Number(row.offer_price);
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      photo: publicUrl(row.image_path),
      originalPrice: original,
      offerPrice: offer,
      discountPercentage:
        original && offer != null && offer < original
          ? Math.round((1 - offer / original) * 100)
          : null,
      serviceId: row.service_id,
      endsOn: row.ends_on,
    };
  });
}
