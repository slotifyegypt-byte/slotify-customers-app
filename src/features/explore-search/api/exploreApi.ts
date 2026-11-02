import { fromPostgrest } from '@/lib/api/errors';
import { supabase } from '@/lib/supabase';

import { toStore, toStoreDetail } from './mappers';
import type { NearbyStore, SearchStore, StoreDetail } from './schemas';

// developer-guide.md §5: `p_limit` is capped at 50 server-side.
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

function definedOnly<T extends Record<string, unknown>>(args: T): { [K in keyof T]?: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined)) as never;
}

export interface NearbyParams {
  latitude: number;
  longitude: number;
  radius_km?: number;
  limit?: number;
}

export async function getNearbyStores(params: NearbyParams): Promise<NearbyStore[]> {
  const { data, error } = await supabase.rpc(
    'search_branches',
    definedOnly({
      p_lat: params.latitude,
      p_lng: params.longitude,
      p_radius_km: params.radius_km,
      p_limit: params.limit === undefined ? undefined : Math.min(params.limit, MAX_LIMIT),
    }),
  );
  if (error) throw fromPostgrest(error);
  return (data ?? []).map(toStore);
}

export interface SearchParams {
  latitude?: number;
  longitude?: number;
  q?: string;
  /** Radius in km, as a numeric string -> `p_radius_km`. */
  distance?: string;
  /** Minimum average rating -> `p_min_rating`. */
  rating?: number;
  /** Timestamp the branch must be open at -> `p_open_on`. */
  availability?: string;
  limit?: number;
  offset?: number;
}

// The rpc has no total count, so "is there another page" is inferred from a
// full page coming back.
export async function searchStores(params: SearchParams): Promise<{ stores: SearchStore[]; hasMore: boolean }> {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const radius = params.distance === undefined ? NaN : Number(params.distance);

  const { data, error } = await supabase.rpc(
    'search_branches',
    definedOnly({
      p_query: params.q,
      p_lat: params.latitude,
      p_lng: params.longitude,
      p_radius_km: Number.isFinite(radius) ? radius : undefined,
      p_min_rating: params.rating,
      p_open_on: params.availability,
      p_limit: limit,
      p_offset: params.offset,
    }),
  );
  if (error) throw fromPostgrest(error);

  const rows = data ?? [];
  return { stores: rows.map(toStore), hasMore: rows.length >= limit };
}

// The header/about part of Venue Detail; services, team, reviews and photos
// are fetched separately by the venue feature. `latitude`/`longitude` are the
// customer's, used only to fill `distance_km` locally.
export async function getStoreDetail(branchId: string, latitude?: number, longitude?: number): Promise<StoreDetail> {
  const { data, error } = await supabase.from('branch_cards').select('*').eq('id', branchId).single();
  if (error) throw fromPostgrest(error);
  const from = latitude != null && longitude != null ? { latitude, longitude } : undefined;
  return toStoreDetail(data, from);
}
