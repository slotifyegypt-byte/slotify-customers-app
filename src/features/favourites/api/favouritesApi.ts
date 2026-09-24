import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import { favouriteCheckSchema, favouriteSchema } from './schemas';

// customer-app-api-map.md §11
// Trailing slash is load-bearing on both calls below: the backend
// 307-redirects the slash-less path to an `http://` (not `https://`)
// Location, which iOS/Android both refuse to follow — the bare path
// silently fails on-device. Calling the canonical slash-terminated path
// avoids the redirect entirely.
export async function getFavourites(params?: { limit?: number; offset?: number }) {
  const response = await apiClient.get('/favourites/', { params });
  return validateResponse(z.array(favouriteSchema), response, 'GET /favourites/');
}

// §5
export async function addFavourite(storeId: string) {
  const response = await apiClient.post('/favourites/', { store_id: storeId });
  return validateResponse(favouriteSchema, response, 'POST /favourites/');
}

export async function removeFavourite(storeId: string) {
  await apiClient.delete(`/favourites/${storeId}`);
}

export async function checkFavourite(storeId: string) {
  const response = await apiClient.get(`/favourites/check/${storeId}`);
  return validateResponse(favouriteCheckSchema, response, `GET /favourites/check/${storeId}`);
}
