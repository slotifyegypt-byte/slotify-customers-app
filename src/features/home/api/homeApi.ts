import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { fromPostgrest } from '@/lib/api/errors';
import { validateResponse } from '@/lib/api/zodFetch';
import { supabase } from '@/lib/supabase';

import { homePageOfferSchema, type StoreCategory } from './schemas';

export async function getCategories(): Promise<StoreCategory[]> {
  const { data, error } = await supabase.from('categories').select('id, slug, name, icon_path').order('sort_order');
  if (error) throw fromPostgrest(error);
  return (data ?? []).map((row) => ({ id: row.id, slug: row.slug, name: row.name, description: null }));
}

export async function getHomeOffers() {
  const response = await apiClient.get('/offers', { params: { active_only: true } });
  return validateResponse(z.array(homePageOfferSchema), response, 'GET /offers?active_only=true');
}
