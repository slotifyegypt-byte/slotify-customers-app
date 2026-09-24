import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import {
  calendarDaySchema,
  galleryItemSchema,
  reviewSchema,
  reviewStatsSchema,
  serviceCategorySchema,
  specialDaySchema,
  teamMemberSchema,
} from './schemas';

// customer-app-api-map.md §5 — the doc calls this `/galleries`; that 404s
// live. Confirmed via openapi.json that the real, public route is singular
// `/gallery` (returns `[]`, not 404, for a store with no photos yet).
export async function getStoreGallery(storeId: string) {
  const response = await apiClient.get(`/stores/${storeId}/gallery`);
  return validateResponse(z.array(galleryItemSchema), response, `GET /stores/${storeId}/gallery`);
}

// §5 — requires auth (customer or same-store-employee token); apiClient
// already attaches the bearer token transparently.
export async function getStoreTeam(storeId: string) {
  const response = await apiClient.get(`/stores/${storeId}/team`);
  return validateResponse(z.array(teamMemberSchema), response, `GET /stores/${storeId}/team`);
}

// §5 — category names for grouping the services tab.
export async function getStoreServiceCategories(storeId: string) {
  const response = await apiClient.get(`/stores/${storeId}/service-categories`);
  return validateResponse(
    z.array(serviceCategorySchema),
    response,
    `GET /stores/${storeId}/service-categories`,
  );
}

// §5 — weekly hours.
export async function getStoreCalendar(storeId: string) {
  const response = await apiClient.get(`/stores/${storeId}/calendar`);
  return validateResponse(z.array(calendarDaySchema), response, `GET /stores/${storeId}/calendar`);
}

// §5 — one-off exceptions to the weekly calendar (holidays, early closes, ...).
export async function getStoreSpecialDays(storeId: string) {
  const response = await apiClient.get(`/stores/${storeId}/special-days`);
  return validateResponse(
    z.array(specialDaySchema),
    response,
    `GET /stores/${storeId}/special-days`,
  );
}

// §5 — VERIFIED against a live response (2026-09-20): now also returns
// `rating_distribution`, the true full 1★–5★ breakdown across every review
// for the store (see schemas.ts).
export async function getStoreReviewStats(storeId: string) {
  const response = await apiClient.get(`/reviews/store/${storeId}/stats`);
  return validateResponse(reviewStatsSchema, response, `GET /reviews/store/${storeId}/stats`);
}

export interface ReviewListParams {
  limit?: number;
  offset?: number;
}

// §5 — paginated via `limit`/`offset` query params; the response itself is
// a bare array (no `total_count` envelope), verified live.
export async function getStoreReviews(storeId: string, params?: ReviewListParams) {
  const response = await apiClient.get(`/reviews/store/${storeId}`, { params });
  return validateResponse(z.array(reviewSchema), response, `GET /reviews/store/${storeId}`);
}
