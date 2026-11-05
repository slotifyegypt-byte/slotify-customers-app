import { toStore } from '@/features/explore-search/api/mappers';
import { ApiError, fromPostgrest } from '@/lib/api/errors';
import { supabase } from '@/lib/supabase';

import type { Favourite, FavouriteCheck } from './schemas';

export async function getFavourites(): Promise<Favourite[]> {
  const { data, error } = await supabase
    .from('favourites')
    .select('branch_id, created_at, branch:branch_cards(*)')
    .order('created_at', { ascending: false });
  if (error) throw fromPostgrest(error);

  // A favourited branch that is no longer active is hidden by RLS, so the
  // embed comes back null — drop it rather than render a hole.
  return (data ?? []).flatMap((row) =>
    row.branch
      ? [
          {
            id: row.branch_id,
            store_id: row.branch_id,
            created_at: row.created_at,
            store: toStore(row.branch),
          },
        ]
      : [],
  );
}

// `customer_id` is filled in server-side from the login.
export async function addFavourite(branchId: string): Promise<void> {
  const { error } = await supabase.from('favourites').insert({ branch_id: branchId });
  // Already a favourite (e.g. a double tap) is the state the caller wanted.
  if (error && error.code !== '23505') throw fromPostgrest(error);
}

// RLS makes a delete of someone else's (or a missing) row a silent no-op, so
// returning the deleted rows is the only way to tell nothing happened.
export async function removeFavourite(branchId: string): Promise<void> {
  const { data, error } = await supabase
    .from('favourites')
    .delete()
    .eq('branch_id', branchId)
    .select();
  if (error) throw fromPostgrest(error);
  if (!data || data.length === 0) throw new ApiError('forbidden', 403, 'Favourite not found');
}

export async function checkFavourite(branchId: string): Promise<FavouriteCheck> {
  const { data, error } = await supabase
    .from('favourites')
    .select('branch_id')
    .eq('branch_id', branchId)
    .maybeSingle();
  if (error) throw fromPostgrest(error);
  return { is_favourite: data !== null };
}
