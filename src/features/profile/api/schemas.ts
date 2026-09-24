import { z } from 'zod';

// customer-app-api-map.md §11 — VERIFIED against the actual backend source
// (2026-09-18, via the backend team) as `CustomerRead`. Notably there is NO
// `name` field — only `first_name`/`last_name` — despite registration
// accepting a `name` field elsewhere. `.passthrough()` for forward safety.
export const customerProfileSchema = z
  .object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string().nullable(),
    gender: z.string().nullable(),
    date_of_birth: z.string().nullable(),
    age: z.number().nullable(),
    email: z.string(),
    phone_country_code: z.string().nullable(),
    phone_number: z.string().nullable(),
    profile_picture: z.string().nullable(),
    status: z.string(),
    created_at: z.string(),
  })
  .passthrough();
export type CustomerProfile = z.infer<typeof customerProfileSchema>;
