import { fromPostgrest } from '@/lib/api/errors';
import { publicUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

import type { HomePageOffer, StoreCategory } from './schemas';

export async function getCategories(): Promise<StoreCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, icon_path')
    .order('sort_order');
  if (error) throw fromPostgrest(error);
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: null,
  }));
}

// The home deals come from `promoted_offer_cards`: running offers at active branches, one flat row per offer with its
// branch card columns. Once Slotify switches paid placements on, only offers that were paid for (or added by Slotify)
// are in it, in placement order; until then it is every running offer. Either way no date filter is needed here.
export async function getHomeOffers(): Promise<HomePageOffer[]> {
  const { data, error } = await supabase
    .from('promoted_offer_cards')
    .select(
      'id, branch_id, category_id, title, description, image_path, original_price, offer_price, starts_on, ends_on, business_name, branch_name, rating_avg, currency, category_slugs, promotion_sort_order',
    )
    .order('promotion_sort_order', { ascending: true, nullsFirst: false })
    .order('ends_on');
  if (error) throw fromPostgrest(error);

  // A view column is nullable in the generated types; a row without its branch or title cannot be shown as a deal.
  return (data ?? []).flatMap((row) => {
    if (!row.id || !row.branch_id || !row.business_name || !row.branch_name) return [];
    const hasDiscount = !!row.original_price && row.offer_price != null;
    return [
      {
        id: row.id,
        store_id: row.branch_id,
        store_name: `${row.business_name} – ${row.branch_name}`,
        store_rating: row.rating_avg ?? 0,
        store_category_slugs: row.category_slugs ?? [],
        title: row.title ?? '',
        description: row.description,
        offer_image: publicUrl(row.image_path),
        original_price: row.original_price,
        discounted_price: row.offer_price,
        discount_percentage: hasDiscount
          ? Math.round((1 - row.offer_price! / row.original_price!) * 100)
          : null,
        valid_from: row.starts_on ?? '',
        valid_to: row.ends_on ?? '',
        category_id: row.category_id,
        currency: row.currency ?? 'EGP',
      },
    ];
  });
}
