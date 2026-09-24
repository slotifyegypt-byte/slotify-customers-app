import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import { nearbyStoreSchema, searchResponseSchema, storeDetailSchema } from './schemas';

export interface NearbyParams {
  latitude: number;
  longitude: number;
  radius_km?: number;
  limit?: number;
}

// customer-app-api-map.md §3
export async function getNearbyStores(params: NearbyParams) {
  const response = await apiClient.get('/stores/search/nearby', { params });
  return validateResponse(z.array(nearbyStoreSchema), response, 'GET /stores/search/nearby');
}

export interface SearchParams {
  latitude?: number;
  longitude?: number;
  q?: string;
  distance?: string;
  rating?: number;
  availability?: string;
  limit?: number;
  offset?: number;
}

// §4
export async function searchStores(params: SearchParams) {
  const response = await apiClient.get('/search', { params });
  return validateResponse(searchResponseSchema, response, 'GET /search');
}

// §5 — the header/about-tab-hours part of Venue Detail; services/team/reviews/galleries
// are fetched separately by the venue feature.
// `latitude`/`longitude`, when given, are sent as `customer_latitude`/
// `customer_longitude` — VERIFIED live (2026-09-20) that this is purely
// additive: it makes `distance_km` come back on the response, and omitting
// both params behaves exactly as before.
export async function getStoreDetail(storeId: string, latitude?: number, longitude?: number) {
  const params =
    latitude != null && longitude != null
      ? { customer_latitude: latitude, customer_longitude: longitude }
      : undefined;
  const response = await apiClient.get(`/stores/${storeId}`, { params });
  return validateResponse(storeDetailSchema, response, `GET /stores/${storeId}`);
}
