import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import { homePageOfferSchema, storeCategorySchema } from './schemas';

// customer-app-api-map.md §2
// Trailing slash is load-bearing: the backend 307-redirects the slash-less
// path, and that redirect's Location header is (buggily) `http://`, not
// `https://` — iOS/Android both block following it, so the bare path
// silently fails on-device (surfaces as "Categories are temporarily
// unavailable" in the UI). Calling the canonical slash-terminated path
// avoids the redirect entirely.
export async function getCategories() {
  const response = await apiClient.get('/store-categories/');
  return validateResponse(z.array(storeCategorySchema), response, 'GET /store-categories/');
}

export async function getHomeOffers() {
  const response = await apiClient.get('/offers', { params: { active_only: true } });
  return validateResponse(z.array(homePageOfferSchema), response, 'GET /offers?active_only=true');
}
