import { fromPostgrest } from '@/lib/api/errors';
import { publicUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

import type { HomePageOffer, StoreCategory } from './schemas';

export async function getCategories(): Promise<StoreCategory[]> {
  const { data, error } = await supabase.from('categories').select('id, slug, name, icon_path').order('sort_order');
  if (error) throw fromPostgrest(error);
  return (data ?? []).map((row) => ({ id: row.id, slug: row.slug, name: row.name, description: null }));
}

// The `offers_public_read` policy only returns active offers that are running
// today at an active branch, so no date filter is needed here. Staff of a
// business can additionally read their own business's offers; customers have
// no business, so that policy never matches for them.
export async function getHomeOffers(): Promise<HomePageOffer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select(
      'id, branch_id, category_id, title, description, image_path, original_price, offer_price, starts_on, ends_on, branch:branch_cards(business_name, branch_name, rating_avg, currency, category_slugs)',
    )
    .order('ends_on');
  if (error) throw fromPostgrest(error);

  // An offer whose branch card is not visible (deactivated branch) comes back
  // with a null embed — skip it rather than render a store-less deal.
  return (data ?? []).flatMap((row) => {
    const branch = row.branch;
    if (!branch) return [];
    const hasDiscount = !!row.original_price && row.offer_price != null;
    return [
      {
        id: row.id,
        store_id: row.branch_id,
        store_name: `${branch.business_name} – ${branch.branch_name}`,
        store_rating: branch.rating_avg,
        store_category_slugs: branch.category_slugs ?? [],
        title: row.title,
        description: row.description,
        offer_image: publicUrl(row.image_path),
        original_price: row.original_price,
        discounted_price: row.offer_price,
        discount_percentage: hasDiscount ? Math.round((1 - row.offer_price! / row.original_price!) * 100) : null,
        valid_from: row.starts_on,
        valid_to: row.ends_on,
        category_id: row.category_id,
        currency: branch.currency,
      },
    ];
  });
}
