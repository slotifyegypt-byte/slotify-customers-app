import type { Database } from '@/lib/database.types';
import { distanceKm } from '@/lib/geo';
import { publicUrl } from '@/lib/storage';

import type { MappableStore, NearbyStore, StoreDetail } from './schemas';

export type BranchCardRow = Database['public']['Views']['branch_cards']['Row'];
export type SearchBranchRow = Database['public']['Functions']['search_branches']['Returns'][number];

// `search_branches` rows carry description and phone but no share_slug, so
// that one is read defensively and left null for them.
type StoreSource = BranchCardRow | SearchBranchRow;

function shareSlug(row: StoreSource): string | null {
  return 'share_slug' in row ? (row.share_slug ?? null) : null;
}

export function isMappable(store: NearbyStore): store is MappableStore {
  return store.latitude != null && store.longitude != null;
}

export function toStore(row: StoreSource): NearbyStore {
  return {
    id: row.id,
    business_id: row.business_id,
    name: `${row.business_name} – ${row.branch_name}`,
    description: row.description ?? null,
    category_slugs: row.category_slugs ?? [],
    logo: publicUrl(row.logo_path),
    address: row.address ?? '',
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    phone: row.phone ?? null,
    rating: row.rating_avg,
    rating_count: row.rating_count,
    share_slug: shareSlug(row),
    timezone: row.timezone,
    status: row.is_open_now ? 'open' : 'closed',
    distance_km: 'distance_km' in row ? (row.distance_km ?? null) : null,
  };
}

// The detail query is a plain branch_cards read, so distance is only known
// when the caller supplies the customer's coordinates.
export function toStoreDetail(
  row: BranchCardRow,
  from?: { latitude: number; longitude: number },
): StoreDetail {
  const store = toStore(row);
  const hasCoordinates = from != null && store.latitude != null && store.longitude != null;
  return {
    ...store,
    amenities: row.amenities ?? [],
    currency: row.currency,
    distance_km: hasCoordinates
      ? distanceKm(from, { latitude: store.latitude!, longitude: store.longitude! })
      : null,
  };
}
