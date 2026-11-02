# Customer App → Supabase Data Layer Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every FastAPI call in the Expo customer app with the Supabase backend (tables/views, RPCs, Edge Functions, Realtime, Storage), keeping screens working with minimal churn.

**Architecture:** Auth already runs on Supabase (`src/lib/supabase.ts`, commits `6da3231`, `6034156`). Only the data layer remains on axios. Each feature's `api/` module is rewritten to call the typed Supabase client and returns the **same view-model types the screens consume today**, via small pure mapper functions (DB row → view model). Mappers are the unit-tested seam; screens change only where the backend's semantics differ (timezones, statuses, ids, phone, notes). Generated `database.types.ts` replaces the hand-transcribed Zod response schemas; Zod stays only for Edge Function JSON.

**Tech Stack:** Expo 57 / React Native 0.86, expo-router, `@supabase/supabase-js` 2.117, TanStack Query 5, zustand, Jest (`jest-expo`) + `@testing-library/react-native`, `date-fns`, `zod`.

**Spec:** Notion "Slotify API — Developer guide" v1.1 (`https://app.notion.com/p/40530c5c158e81788398c4bce8a7c82e`), repo copy `/Users/omar.soudy/Desktop/Slotify/Backend/docs/developer-guide.md`. Supporting: Design 1 — Data model (`Backend/docs/01-data-model.md`), Design 2 — Permissions. Notion task `SLT-15` ("Phase 6 — Move apps to Supabase") is the umbrella.

## Global Constraints

- Project URL `https://razxudowdgluavqycujt.supabase.co`; Edge Functions at `<url>/functions/v1`. Only the **publishable** key ships in the app; never a service-role key.
- The old FastAPI endpoints (`/api/v1/...`) are retired. No new code may call them.
- **Every RPC parameter starts with `p_`.**
- Signed-in Edge Function calls send `Authorization: Bearer <access_token>` **and** `apikey: <publishable key>`. `availability` is public (`apikey` only).
- Every instant is **UTC**; display in the **branch's** IANA `timezone`, not the phone's. `day_of_week` 1 = Monday … 7 = Sunday; a closing time earlier than the opening time runs past midnight; several rows per day mean split shifts.
- Availability `date` is the **branch's local date** (`YYYY-MM-DD`).
- Money is `numeric(12,2)`; format with the business `currency` (ISO 4217). No hard-coded symbols.
- Phone is one E.164 column (`+201001234567`); `gender` is `male` | `female`.
- Tables store Storage **paths** (`…_path`), never URLs. Public bucket `public-media` (≤ 5 MB), `avatars` (≤ 2 MB).
- Enums are lowercase. `booking_status`: `pending, confirmed, completed, cancelled, no_show`. `notification_type`: `booking_created, booking_confirmed, booking_rescheduled, booking_cancelled, booking_reminder, pickup_ready, message_received, review_received, time_off_decided, general`.
- Errors: tables/RPCs return `error.code` `PT401/403/404/409/410/422` with a machine code in `error.message`, plus `42501`, `23505`, `23514`. Edge Functions return a real HTTP status and `{ code, message }`. An RLS-filtered read returns `[]`; an RLS-refused update changes **0 rows with no error**.
- Naming: the backend says "branch", the app says "store"/"venue". Keep app-facing names in this pass; map at the API boundary. Do not rename routes or screens here.
- **Do not trigger EAS builds** (limited quota; build only on Omar's explicit ask). Everything in Tasks 0–9 is JS-only; Task 10's push registration may need a rebuilt binary and is called out there.
- Match surrounding style: Prettier config in `.prettierrc.json`, the repo's explanatory-comment density, `@/` alias imports.

## Review Focus

Failure modes the guide implies but no happy-path task exercises, most likely first. Each has a pinned test in the owning task.

1. **Time zones and DST.** A booking at `2026-11-02T22:30:00Z` is already *tomorrow* in Cairo; Cairo is UTC+3 in summer, UTC+2 in winter; a Warsaw branch differs again. The old fixed `+02:00` hack silently shifts times. (Task 1, Task 5)
2. **`slot_taken` / `slot_unavailable` race** between seeing a slot and booking it: refresh availability, drop only the conflicting draft entry, tell the user; never leave the spinner or a half-booked multi-service draft. (Task 6)
3. **Silent zero-row writes.** RLS-refused `update`/`delete` return success with no rows (profile edit, review edit/delete, notification mark-read, unfavourite). Treat "0 rows" as failure. (Tasks 2, 3, 7, 9)
4. **Signed in but no `customers` row** (first sign-in, or two screens fetching at once → `23505`). Must create-then-refetch exactly once and never surface `customer_profile_required` as a crash. (Task 2)
5. **Realtime lifecycle.** Own message echoes back (dedupe by `id`); channel must be removed on unmount and on sign-out; catch up after reconnect; notification badge channel must not leak across accounts. (Tasks 8, 9)

## Backend gaps to resolve (ask the backend, don't paper over)

| # | Gap | Interim in this plan |
| --- | --- | --- |
| G1 | No review stats / rating distribution RPC (old `GET /reviews/store/{id}/stats`). | Average + count from `branch_cards`; distribution via five `head` count queries (`rating = 1..5`). Request `get_review_stats(p_branch_id)`. |
| G2 | `search_branches` returns no total count, `description`, `phone`, `amenities`. | `hasMore = rows.length === p_limit`; detail screen reads `branch_cards` + `branches` row. |
| G3 | Guide lists no delete policy for `notifications`. | Task 9 step checks `pg_policies`; if absent, remove swipe-to-delete rather than ship a button that does nothing. |
| G4 | Per-service booking `note` is gone; only `customer_note` on the booking. | Draft notes are joined into one `customer_note`. Behaviour change, called out in Task 6. |
| G5 | No customer notification preferences in the backend. | `notificationPreferencesStore` stays local-only; it does not control server pushes. |

---

## File Structure

New (shared plumbing):
- `src/lib/database.types.ts` — copy of `Backend/types/database.types.ts`; `package.json` script `types:sync` re-copies it.
- `src/lib/api/errors.ts` — `ApiError`, `fromPostgrest`, `fromResponse`.
- `src/lib/api/functions.ts` — `callFunction` for signed-in Edge Functions, `callPublicFunction` for `availability`.
- `src/lib/storage.ts` — `publicUrl(path, bucket)`.
- `src/lib/money.ts` — `formatMoney(amount, currency)`.
- `src/lib/geo.ts` — `distanceKm(a, b)` (detail screen has no RPC distance).
- `src/lib/time/branchTime.ts` — timezone-aware formatting and local-date helpers.
- `src/test/mockSupabase.ts` — chainable query-builder mock used by API-module tests.
- `src/features/<feature>/api/mappers.ts` — pure row → view-model functions, one file per feature that needs them.

Modified: every `src/features/*/api/*Api.ts`, `schemas.ts` (types become hand-declared view models), the hooks that pass ids/params, `src/features/booking/utils/time.ts` (shrinks to re-exports then removed), `src/features/chat/hooks/useBookingChat.ts`, `src/features/notifications/utils/notificationVisual.ts`, `src/features/home/utils/categoryIcon.ts`.

Deleted at the end (Task 11): `src/lib/api/client.ts`, `src/lib/api/zodFetch.ts`, `src/features/booking/utils/apiError.ts`, `src/features/activity/api/teamApi.ts` (duplicate of venue's), axios.

Order is by dependency: plumbing → time → profile (every later write needs a `customers` row) → catalogue → venue → bookings → availability/booking writes → reviews → chat → notifications → home extras → cleanup.

---

### Task 0: Plumbing, typed client, test harness, dev sign-in

**Files:**
- Create: `src/lib/database.types.ts`, `src/lib/api/errors.ts`, `src/lib/api/functions.ts`, `src/lib/storage.ts`, `src/lib/money.ts`, `src/lib/geo.ts`, `src/test/mockSupabase.ts`, tests beside each (`*.test.ts`)
- Modify: `src/lib/supabase.ts` (generic `createClient<Database>`), `package.json` (`types:sync` script; fix the invalid jest key `setupFilesAfterEach`), `src/features/auth/screens/SignInScreen.tsx` (dev-only password sign-in), `.env.local` check

**Interfaces:**
- Produces:
  - `class ApiError extends Error { readonly code: string; readonly status: number }`
  - `fromPostgrest(e: { code?: string; message: string; details?: string }): ApiError` — `PTnnn` → `{ code: e.message, status: nnn }`; `23505` → `{ code: 'duplicate', status: 409 }`; `42501` → `{ code: 'forbidden', status: 403 }`; `23514` → `{ code: 'invalid_field', status: 400 }`; anything else → `{ code: 'unknown', status: 500 }`
  - `fromResponse(res: Response): Promise<ApiError>` — reads `{ code, message }`
  - `isApiError(e: unknown, code?: string): e is ApiError`
  - `callFunction<T>(path: string, init?: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown }): Promise<T>` — `path` like `'bookings'`, `'bookings/items/<id>'`, `'account/me'`; throws `ApiError`
  - `callPublicFunction<T>(path: string, query: Record<string, string>): Promise<T>`
  - `publicUrl(path: string | null | undefined, bucket?: 'public-media' | 'avatars'): string | null`
  - `formatMoney(amount: number, currency: string, locale?: string): string`
  - `distanceKm(a: {latitude: number; longitude: number}, b: {latitude: number; longitude: number}): number`
  - `mockQuery(result: { data?: unknown; error?: unknown; count?: number }): { builder; calls: Array<[method: string, args: unknown[]]> }` — every builder method returns itself; awaiting resolves to `result`.

- [ ] **Step 1: Confirm the environment.** `.env.local` has `EXPO_PUBLIC_SUPABASE_URL=https://razxudowdgluavqycujt.supabase.co` and the publishable key from the guide. Run `npm run typecheck && npm test` and record the baseline (there are currently no test files).
- [ ] **Step 2: Write failing tests** — `errors.test.ts`: `fromPostgrest({code:'PT409',message:'last_owner'})` → `code 'last_owner'`, `status 409`; `{code:'23505'}` → `duplicate/409`; `{code:'42501'}` → `forbidden/403`; `fromResponse(new Response(JSON.stringify({code:'slot_taken',message:'x'}),{status:409}))` → `slot_taken/409`. `storage.test.ts`: `publicUrl(null)` is `null`; `publicUrl('branches/b/p.jpg')` ends with `/storage/v1/object/public/public-media/branches/b/p.jpg`. `money.test.ts`: `formatMoney(300,'EGP')` contains `300`; `formatMoney(80,'PLN')` contains `80` and not `EGP`. `geo.test.ts`: Cairo→Giza ≈ 12–14 km. `functions.test.ts`: with `global.fetch` mocked, `callFunction('bookings',{method:'POST',body:{a:1}})` sends both `Authorization: Bearer tok` and `apikey`, JSON body, and a 409 response throws `ApiError` with the body's `code`.
- [ ] **Step 3: Run `npx jest src/lib` — expect FAIL** (modules missing).
- [ ] **Step 4: Implement** the files above. `functions.ts` gets the token from `supabase.auth.getSession()` (which refreshes if expired) — this replaces the axios 401-refresh interceptor, which can be dropped because supabase-js owns refresh. `storage.ts` uses `supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl`. Type the client: `createClient<Database>(...)`; run `npm run typecheck` and fix fallout (the profile/auth code is the only current user).
- [ ] **Step 5: Dev-only password sign-in.** The demo accounts (`lina@slotify.dev` has past and upcoming bookings, password `password123`) are email/password; the app only offers Google/Apple, so none of the later manual checks are possible without this. Add an email/password form on `SignInScreen` rendered only when `appConfig.env !== 'production'`, calling `supabase.auth.signInWithPassword`. Production bundles must not include the form (assert via a render test with `env: 'production'`).
- [ ] **Step 6: Run `npx jest src/lib && npm run typecheck && npm run lint` — expect PASS.**
- [ ] **Step 7: Commit** — `feat: typed supabase client, api error/function helpers, test harness`

---

### Task 1: Branch-timezone time utilities

Replaces the fixed `CAIRO_OFFSET` workaround in `src/features/booking/utils/time.ts`. The backend now stores true UTC and publishes each branch's IANA timezone, so the workaround's reason for existing is gone.

**Files:**
- Create: `src/lib/time/branchTime.ts`, `src/lib/time/branchTime.test.ts`
- Modify: `src/features/booking/utils/time.ts` (delegate or remove `toBookingTimestamp`, `CAIRO_OFFSET`, `toCairoParts`), all importers (`tsc` lists them)

**Interfaces:**
- Produces (all take the branch `timeZone` as an argument — none read the device zone):
  - `formatHour(iso: string, timeZone: string): string` → `"10:00 AM"`
  - `formatDate(iso: string, timeZone: string): string` → `"25 Sep. 2026"`
  - `formatDateTitle(iso: string, timeZone: string, now?: Date): string` → `"Today Morning" | "Tomorrow Afternoon" | "In 3 days" | "2 days ago"`
  - `branchLocalDate(instant: Date | string, timeZone: string): string` → `"YYYY-MM-DD"`
  - `branchToday(timeZone: string, now?: Date): string`

- [ ] **Step 1: Write failing tests** pinning the Review Focus cases: `formatHour('2026-07-01T08:00:00Z','Africa/Cairo')` is `11:00 AM` (DST, UTC+3); `formatHour('2026-11-02T08:00:00Z','Africa/Cairo')` is `10:00 AM` (UTC+2); `formatHour('2026-11-02T08:00:00Z','Europe/Warsaw')` is `9:00 AM`; `branchLocalDate('2026-11-02T22:30:00Z','Africa/Cairo')` is `2026-11-03`; `formatDateTitle('2026-11-03T06:00:00Z','Africa/Cairo', new Date('2026-11-02T10:00:00Z'))` is `Tomorrow Morning`.
- [ ] **Step 2: Run `npx jest src/lib/time` — expect FAIL.**
- [ ] **Step 3: Implement with `Intl.DateTimeFormat(..., { timeZone, ... }).formatToParts`**; compute day differences from local `YYYY-MM-DD` strings, not from timestamps.
- [ ] **Step 4: Verify Hermes `Intl` honours `timeZone` on-device** (iOS simulator run of the Activity tab with one Warsaw booking) — Jest on Node passing does not prove this.
- [ ] **Step 5: Run `npx jest src/lib/time && npm run typecheck` — expect PASS** (callers are updated in Tasks 5–6 as they are rewritten; until then keep thin re-exports so the build stays green).
- [ ] **Step 6: Commit** — `feat: branch-timezone time helpers`

---

### Task 2: Profile, account deletion, auth hand-off

**Files:**
- Modify: `src/features/profile/api/profileApi.ts`, `src/features/profile/api/schemas.ts`, `src/features/profile/hooks/useProfile.ts`, `src/features/profile/screens/EditProfileScreen.tsx`, `src/features/profile/screens/ProfileScreen.tsx`
- Create: `src/features/profile/api/mappers.ts`, `src/features/profile/api/profileApi.test.ts`

**Interfaces:**
- Consumes: `fromPostgrest`, `callFunction`, `publicUrl` (Task 0).
- Produces:
  - `CustomerProfile = { id: string; first_name: string; last_name: string | null; gender: 'male'|'female'|null; date_of_birth: string | null; email: string | null; phone: string | null; avatar_url: string | null }` — `phone_country_code`/`phone_number` collapse into E.164 `phone`; `profile_picture` becomes `avatar_url` (built from `avatar_path`).
  - `getMe(): Promise<CustomerProfile>`; `updateMe(patch: Partial<Pick<CustomerProfile,'first_name'|'last_name'|'gender'|'date_of_birth'|'phone'>>): Promise<CustomerProfile>`; `deleteMe(): Promise<void>`
  - `isE164(value: string): boolean` (`/^\+[1-9]\d{6,14}$/`)

- [ ] **Step 1: Write failing tests** (mocked client): `getMe` returns the mapped row when `customers…maybeSingle()` yields one; with `null` it inserts `{ first_name, last_name }` taken from `pendingProfile` → `user_metadata.given_name/full_name` → email local-part (same precedence as today) and returns that row; when that insert fails with `23505` it refetches and returns the winner (Review Focus 4); `updateMe` throws `ApiError('forbidden')` when the update returns zero rows (Review Focus 3); `updateMe({phone:'0100'})` rejects with `invalid_field` before any request; `deleteMe` calls `DELETE account/me`.
- [ ] **Step 2: Run `npx jest src/features/profile` — expect FAIL.**
- [ ] **Step 3: Implement.** `getMe` = `from('customers').select('*').maybeSingle()` (RLS scopes to the caller). Keep the app's auto-create-from-OAuth-name behaviour instead of the guide's "complete your profile" screen: first/last name are the only required columns, so nothing is lost; `user_id` and `email` are server-filled, don't send them. `updateMe` = `.update(patch).eq('id', id).select().single()`. `deleteMe` ignores `login_deleted` and always calls `useLogout`'s local sign-out afterwards (a customer who is also a partner keeps their login, but this app's session must still end).
- [ ] **Step 4: Update `EditProfileScreen`.** One phone field validated with `isE164`, with the "saved immediately, not verified" note kept; map `invalid_field` to a field error. The avatar edit stays "not available yet" — photo upload needs `expo-image-picker`, a native module, so it needs a new binary and is deferred (see Deferred).
- [ ] **Step 5: Run `npx jest src/features/profile && npm run typecheck` — expect PASS.**
- [ ] **Step 6: Manual check** as `lina@slotify.dev`: profile loads, edit name persists after app restart, bad phone shows an inline error.
- [ ] **Step 7: Commit** — `feat(profile): customers table, E.164 phone, account delete via edge function`

---

### Task 3: Categories, nearby/search/detail, favourites

**Files:**
- Modify: `src/features/home/api/homeApi.ts` (categories only here; offers in Task 10), `src/features/home/utils/categoryIcon.ts`, `src/features/explore-search/api/exploreApi.ts`, `src/features/explore-search/api/schemas.ts`, `src/features/explore-search/hooks/*.ts`, `src/features/favourites/api/favouritesApi.ts`, `src/features/favourites/api/schemas.ts`, `src/features/favourites/hooks/*.ts`, `src/features/home/screens/{HomeScreen,SearchScreen}.tsx`, `ExploreScreen.tsx`, `StoreCard.tsx` consumers
- Create: `src/features/explore-search/api/mappers.ts`, `exploreApi.test.ts`, `favouritesApi.test.ts`

**Interfaces:**
- Produces:
  - `StoreCategory = { id: string; slug: string; name: string; description: null }` — `id` is now a uuid string, **not a number**; `categoryIcon` keys on `slug`.
  - `NearbyStore` / `SearchStore` / `StoreDetail` keep their current field names (`id`, `name`, `logo`, `address`, `rating`, `status`, `distance_km`, `category_id`…) but `id`s are strings and `logo` is a built public URL. `toStore(row: Database['public']['Views']['branch_cards']['Row'] | SearchBranchRow): NearbyStore` in `mappers.ts`; `name` = `` `${business_name} – ${branch_name}` ``; `status` = `is_open_now ? 'open' : 'closed'`.
  - `getNearbyStores({ latitude, longitude, radius_km?, limit? }): Promise<NearbyStore[]>`
  - `searchStores(params: SearchParams): Promise<{ stores: SearchStore[]; hasMore: boolean }>` — `total_count` is dropped (G2); fix its consumers.
  - `getStoreDetail(branchId: string, latitude?: number, longitude?: number): Promise<StoreDetail>`
  - `getFavourites(): Promise<Favourite[]>`, `addFavourite(branchId)`, `removeFavourite(branchId)`, `checkFavourite(branchId): Promise<{ is_favourite: boolean }>` — `Favourite.id` becomes `branch_id` (favourites have a composite key, no row id).

- [ ] **Step 1: Read the screens' real use** of `SearchParams.distance`, `.rating`, `.availability` and of `total_count` (`SearchScreen.tsx`, `useSearchStores.ts`) and write down the mapping to `p_radius_km`, `p_min_rating`, `p_open_on` before coding. List the seeded category slugs (`from('categories')` as the demo user) and map each to an existing icon in `categoryIcon.ts` with a generic fallback.
- [ ] **Step 2: Write failing tests**: `getNearbyStores` calls `rpc('search_branches', { p_lat, p_lng, p_radius_km, p_limit })` and maps the first row to `{ id, name: 'Glamour Studio – Maadi', status: 'open' }`; `searchStores({q:'hair', limit:20})` returns `hasMore:true` for 20 rows and `false` for 7; `getStoreDetail` queries `branch_cards` `.eq('id', …).single()` and fills `distance_km` from `distanceKm` only when coordinates are passed; `addFavourite` inserts `{ branch_id }` only (no `customer_id`); `removeFavourite` throws on zero deleted rows (Review Focus 3); `getFavourites` maps `branch:branch_cards(*)` through `toStore`.
- [ ] **Step 3: Run `npx jest src/features/explore-search src/features/favourites` — expect FAIL.**
- [ ] **Step 4: Implement** per the interfaces. The detail screen also needs `description`/`phone`/`amenities` (G2): select them from `branches` for that id after verifying a customer can read an `active` branch row; if `branches` is not readable, stop and raise it with the backend instead of widening the app.
- [ ] **Step 5: Run the tests + `npm run typecheck` — expect PASS.** Fix every number→string id fallout (`categoryNameById`, map pins keyed by id).
- [ ] **Step 6: Manual check**: Home categories, nearby map pins around the demo Cairo coordinates, search with a query, favourite then unfavourite on Warsaw Barbers.
- [ ] **Step 7: Commit** — `feat(explore): categories, branch search/nearby/detail and favourites on supabase`

---

### Task 4: Venue detail (hours, photos, services, team, reviews)

**Files:**
- Modify: `src/features/venue/api/venueApi.ts`, `schemas.ts`, `src/features/venue/hooks/*.ts`, `src/features/venue/components/{AboutTab,ServicesTab,TeamSection,ReviewsTab,GallerySection}.tsx`, `src/features/booking/api/bookingApi.ts` (`getStoreServices`, `getStoreEmployeesForService`), `src/features/booking/hooks/useStoreServices.ts`, `src/features/activity/hooks/useStoreTeam.ts`
- Create: `src/features/venue/api/mappers.ts`, `venueApi.test.ts`

**Interfaces:**
- Produces:
  - `getStoreCalendar(branchId): Promise<HoursDay[]>` where `HoursDay = { day_of_week: 1..7; intervals: Array<{ opens_at: string; closes_at: string; crosses_midnight: boolean }> }` (empty `intervals` = closed). `AboutTab` renders from this; the old `week_day` string / `hours_str` go away.
  - `getStoreSpecialDays(branchId)` → `{ date; is_closed; opens_at: string | null; closes_at: string | null; reason: string | null }[]` for `date >= branchToday(tz)`.
  - `getStoreGallery(branchId)` → `{ id: string; imageUrl: string }[]` (ordered by `sort_order`; `publicUrl(image_path)`).
  - `getStoreTeam(branchId)` → `rpc('get_branch_team')` mapped to `TeamMember { id, first_name, last_name, profile_picture (url), role_name (= job_title), bio, service_ids }`.
  - `getStoreServices(branchId): Promise<Service[]>` — `Service { id; name; description; image_path→service_image url; duration_minutes; price: number (branch price ?? service price); currency: string; requires_specialist: boolean (booking_mode === 'specialist'); max_concurrent_bookings: number | null (capacity); category: { id; name; sort_order } | null }`. Service categories come embedded, so `getStoreServiceCategories` and its hook are removed.
  - `getStoreEmployeesForService(branchId, serviceId): Promise<BookingEmployee[]>` — one `get_branch_team` call filtered by `service_ids.includes(serviceId)` (replaces today's two-call cross-reference).
  - `getStoreReviews(branchId, { limit, offset })` → `VenueReview[]` (`reviewer_name`→`customer_name`, `reply`→`owner_reply`, `replied_at`→`owner_reply_at`, `id` string); `getStoreReviewStats(branchId)` → `{ average_rating, total_reviews, rating_distribution }` per G1.

- [ ] **Step 1: Write failing tests**: hours mapper groups rows by `day_of_week`, keeps split shifts as two intervals in order, and flags `22:00→02:00` as `crosses_midnight` (Review Focus 1); a day with no rows → `intervals: []`; services mapper uses `branch_services.price` over `services.price` and `0` is a valid override (use `??`, not `||`); `booking_mode:'capacity'` → `requires_specialist:false`, `max_concurrent_bookings` from `capacity`; archived services and `is_active:false` branch services are excluded; `getStoreEmployeesForService` returns only members whose `service_ids` include the service; review stats distribution has keys `'1'..'5'` filled from five count queries.
- [ ] **Step 2: Run `npx jest src/features/venue` — expect FAIL.**
- [ ] **Step 3: Implement**, using the guide's select strings verbatim for services (`branch_services` with nested `service:services(...)`, `category:service_categories(name, sort_order)`). Replace `price_symbol` usage with `formatMoney(price, currency)` in `ServicesTab` and the booking flow.
- [ ] **Step 4: Run tests + `npm run typecheck` — expect PASS.**
- [ ] **Step 5: Manual check**: Glamour Studio (split/odd hours, multiple categories), Shiny Cars (capacity, open till midnight → past-midnight rendering), Warsaw Barbers (PLN formatting).
- [ ] **Step 6: Commit** — `feat(venue): hours, photos, services, team and reviews on supabase`

---

### Task 5: My bookings, booking detail, cancel

**Files:**
- Modify: `src/features/booking/api/bookingApi.ts` (`getMyBookings`, `getBooking`, `cancelBooking`), `schemas.ts`, `queryKeys.ts`, `hooks/{useMyBookings,useBookingDetail}.ts`, `src/features/activity/screens/{ActivityScreen,BookingDetailScreen,CancelBookingScreen}.tsx`, `src/features/home/screens/HomeScreen.tsx` (next-up / book-again), `NextUpCard`, `BookAgainCard`
- Create: `src/features/booking/api/mappers.ts`, `bookingApi.test.ts`

**Interfaces:**
- Consumes: `toStore` (Task 3), `formatHour/formatDate/formatDateTitle` (Task 1).
- Produces:
  - `BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'` — **`no_show` is new**; add a badge/label wherever statuses render (Activity list, detail).
  - `BookingRead` keeps today's field names so screens barely change: `id`, `store_id`, `store_name`, `store_logo`, `store_address`, `store_rating`, `booking_status`, `booking_type` (`'drop_off'` when every item has `employee_id === null`, else `'appointment'`), `total_price`, `currency` (new), `timezone` (new), `booking_date` (= `starts_at`), `booking_date_title/_str`, `booking_hour_str`, `booking_services_str`, `has_review: boolean` (new, from the `reviews` array), `booking_services: BookingServiceRead[]` with `id: string` (the `booking_items.id`, used for reschedule), `booking_start_time`/`booking_end_time` (UTC ISO), `service_name`, `employee_id`, `booking_status`. The `_title/_str/_hour_str` fields are computed client-side with the branch timezone — no longer server strings.
  - `getMyBookings(status?: BookingStatus): Promise<BookingRead[]>`; `getBooking(id: string): Promise<BookingRead>`; `cancelBooking(id: string, reason?: string): Promise<BookingRead>`.

- [ ] **Step 1: Write failing tests**: mapper turns a row with two items into `booking_services` (ids are strings) and builds `booking_services_str`; `booking_type` is `drop_off` for an all-null-employee booking; `reviews: []` → `has_review:false` and one element → `true`; hour/date strings use the branch `timezone` (Warsaw booking differs from a Cairo one at the same instant); `getMyBookings('confirmed')` adds `.eq('status','confirmed')` and orders `starts_at desc`; `cancelBooking` calls `rpc('transition_booking', { p_booking_id, p_to_status:'cancelled', p_reason })` then refetches and returns the booking; a `PT409 invalid_transition` surfaces as `ApiError('invalid_transition')`.
- [ ] **Step 2: Run `npx jest src/features/booking` — expect FAIL.**
- [ ] **Step 3: Implement** using the guide's `select('*, items:booking_items(*), branch:branch_cards(*), reviews:reviews!reviews_booking_id_branch_id_fkey(id, rating)')` verbatim — the relationship name is required because reviews link to bookings twice.
- [ ] **Step 4: Update the screens** that read `booking_status` for the `no_show` case, and show a clear message for `invalid_transition` on Cancel.
- [ ] **Step 5: Run tests + `npm run typecheck` — expect PASS.**
- [ ] **Step 6: Manual check** as `lina@slotify.dev`: Activity upcoming/past tabs, times match the branch clock, cancel an upcoming booking, Home next-up card updates.
- [ ] **Step 7: Commit** — `feat(bookings): list, detail and cancel on supabase`

---

### Task 6: Availability, create booking, reschedule, rebook

The highest-risk task. Uses `stream=0` (one JSON document) rather than NDJSON streaming: same data, no `expo/fetch` dependency, no "stream ended without `done`" failure mode. Progressive streaming is a later latency optimisation (see Deferred).

**Files:**
- Modify: `src/features/booking/api/bookingApi.ts` (`getAvailability`, `createBooking`, `rescheduleBookingService`, `draftEntryToPayload`), `schemas.ts`, `hooks/{useAvailability,useCreateBooking}.ts`, `state/bookingDraftStore.ts`, `utils/draftConflicts.ts`, `components/{BookingFlow,SlotGrid,SpecialistPicker,DateStrip}.tsx`, `screens/{ServiceBookingConfigScreen,ConfirmationScreen,RebookSheetScreen}.tsx`, `src/features/activity/screens/RescheduleBookingScreen.tsx`
- Create: `src/features/booking/api/availability.test.ts`, `createBooking.test.ts`

**Interfaces:**
- Consumes: `callPublicFunction`, `callFunction`, `ApiError` (Task 0); `branchToday`, `formatHour` (Task 1).
- Produces:
  - `AvailabilityParams = { store_id: string; service_id: string; date: string /* branch-local YYYY-MM-DD */; employee_id?: string }`
  - `AvailabilityResponse = { store_id; service_id; date; timezone: string; service_duration_minutes: number; step_minutes: number; price: number; booking_mode: 'specialist' | 'capacity'; employees: Array<{ employee_id; employee_name; available_slots: AvailabilitySlot[] }>; slots: AvailabilitySlot[] }` where `AvailabilitySlot = { start_time: string; end_time: string /* UTC ISO */; employee_id: string | null; employee_name: string | null; capacity_remaining: number | null; time_slot_str: string /* formatted in `timezone` */ }`. `price` arrives as a string (`"300.00"`) and is converted with `Number`. The old `is_available`/`capacity_total`/`capacity_booked` fields go; the server only returns free slots.
  - `CreateBookingItem = { service_id: string; employee_id?: string; starts_at: string }`; `createBooking(branchId: string, items: CreateBookingItem[], customerNote?: string): Promise<{ id: string }>` (the server derives end times, buffers and prices; max 10 items; capacity services omit `employee_id`). Callers then read the full view model via `getBooking(id)` (Task 5).
  - `rescheduleBookingService(itemId: string, params: { starts_at: string }): Promise<void>` → `PATCH bookings/items/{itemId}`.
  - `getBookingErrorMessage(error: unknown, fallback: string): string` and `isSlotConflict(error: unknown): boolean` (`slot_taken` | `slot_unavailable`), reusing `ApiError`.

- [ ] **Step 1: Read `SlotGrid`, `SpecialistPicker`, `BookingFlow`, `bookingDraftStore`, `draftConflicts`** to see which of `employees`/`slots` each consumes and how "Any specialist" merges employees; the merged, earliest-first list is built client-side from the per-employee slots.
- [ ] **Step 2: Write failing tests** (mock `fetch`): `getAvailability` requests `…/functions/v1/availability?branch_id&service_id&date&stream=0` with only `apikey` (no `Authorization`); a specialist document maps to `employees[].available_slots` with `time_slot_str` in the branch zone; a capacity document maps to flat `slots` with `capacity_remaining`; an unknown branch (404) throws `ApiError`; all-empty `employees` is a valid empty result, not an error. `createBooking` POSTs `{ branch_id, items, customer_note }` with both auth headers, returns the booking id from `201 { booking }`; a `409 slot_taken` rejects with `ApiError('slot_taken')` and `isSlotConflict` is true (Review Focus 2); `draftEntryToPayload` omits `employee_id` for capacity services and joins per-service notes into one `customer_note` (G4); `rescheduleBookingService` PATCHes the item path with `{ starts_at }`.
- [ ] **Step 3: Run `npx jest src/features/booking` — expect FAIL.**
- [ ] **Step 4: Implement.** `DateStrip` must generate dates from `branchToday(timezone)`, and the screen must pass the **branch's** timezone (from the branch card), not the phone's. On `isSlotConflict` in `BookingFlow`: invalidate the availability query for that service/date, remove only the conflicting entry via `draftConflicts`, and show an inline message; other entries stay. On `customer_profile_required` route to profile completion; `time_in_past` → refresh and message.
- [ ] **Step 5: Reschedule/rebook.** Reschedule changes time only (customers cannot change the employee); rebook prefills a normal create from a past booking.
- [ ] **Step 6: Run tests + `npm run typecheck` — expect PASS.**
- [ ] **Step 7: Manual check** as `lina@`: book a haircut at Glamour Maadi (specialist and "Any specialist"), book a car wash (capacity), book two services in one booking, reschedule one, rebook a past booking. Book the same slot from two sessions (`lina@` and `youssef@`) to see `slot_taken` handled.
- [ ] **Step 8: Commit** — `feat(booking): availability, create, reschedule via edge functions`

---

### Task 7: Reviews (write, edit, delete, my reviews)

**Files:**
- Modify: `src/features/reviews/api/reviewsApi.ts`, `schemas.ts`, `hooks/*.ts`, `screens/{WriteReviewScreen,MyReviewsScreen}.tsx`
- Create: `src/features/reviews/api/reviewsApi.test.ts`

**Interfaces:**
- Consumes: `VenueReview` mapper (Task 4).
- Produces: `createReview({ booking_id: string; rating: number; comment?: string }): Promise<VenueReview>`; `updateReview(id: string, { rating?; comment? }): Promise<VenueReview>`; `deleteReview(id: string): Promise<void>`; `getCustomerReviews(customerId: string): Promise<VenueReview[]>`. `booking_id` is now **required** (the old API let it be optional); review ids are strings.

- [ ] **Step 1: Write failing tests**: `createReview` inserts `{ booking_id, rating, comment }` only; a `23505` becomes `ApiError('duplicate')` with a "you already reviewed this booking" message; a `42501` (booking not completed / not yours) becomes `forbidden`; `updateReview`/`deleteReview` throw when zero rows change (Review Focus 3).
- [ ] **Step 2: Run `npx jest src/features/reviews` — expect FAIL.**
- [ ] **Step 3: Implement.** `WriteReviewScreen` is only reachable from a completed booking without a review (`has_review` from Task 5); keep that guard and still handle the server errors.
- [ ] **Step 4: Run tests + `npm run typecheck` — expect PASS.**
- [ ] **Step 5: Manual check**: review a completed booking as `lina@`, edit it, see the branch rating update, delete it, confirm a second review on the same booking is refused.
- [ ] **Step 6: Commit** — `feat(reviews): reviews on supabase`

---

### Task 8: Booking chat on Realtime

**Files:**
- Modify: `src/features/chat/api/chatApi.ts`, `schemas.ts`, `hooks/useBookingChat.ts`, `screens/OrderChatScreen.tsx`, `src/features/auth/hooks/useLogout.ts` (`supabase.removeAllChannels()`)
- Create: `src/features/chat/api/chatApi.test.ts`, `src/features/chat/hooks/mergeMessage.test.ts`

**Interfaces:**
- Produces:
  - `BookingMessage = { id: string; booking_id: string; sender: 'customer' | 'branch'; message: string /* = body */; read_at: string | null; created_at: string }`
  - `getBookingMessages(bookingId: string, limit?: number): Promise<BookingMessage[]>` — newest `limit` rows, returned oldest-first
  - `sendBookingMessage(bookingId: string, body: string): Promise<BookingMessage>` (1–2000 chars after trim, validated client-side)
  - `markBookingMessagesRead(bookingId: string): Promise<void>` → `rpc('mark_messages_read', { p_booking_id })`
  - `getBookingUnreadCount(bookingId: string): Promise<{ unread_count: number }>` — head count of `sender = 'branch'` and `read_at is null`
  - exported pure `mergeMessage(prev: BookingMessage[] | undefined, incoming: BookingMessage): BookingMessage[]` (dedupe by `id`, keep order)
  - `useBookingChat(bookingId)` keeps its return shape (`isSocketConnected` becomes "channel subscribed").

- [ ] **Step 1: Write failing tests**: `mergeMessage` ignores a message whose `id` is already present and appends a new one (own-send echo, Review Focus 5); `getBookingMessages` maps `body`→`message` and reverses a newest-first page; `sendBookingMessage` inserts `{ booking_id, body }` only; `getBookingUnreadCount` returns the count from a `head: true` query; sending an empty/whitespace body rejects before any request.
- [ ] **Step 2: Run `npx jest src/features/chat` — expect FAIL.**
- [ ] **Step 3: Implement the hook with `supabase.channel('booking-' + bookingId).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booking_messages', filter: 'booking_id=eq.<id>' }, …).subscribe(status => …)`.** Delete the hand-rolled WebSocket, backoff and token plumbing (supabase-js rejoins itself). On a `SUBSCRIBED` status after the first one, invalidate the messages query to catch up on anything missed. Cleanup `supabase.removeChannel(channel)`. Map realtime `payload.new` through the same mapper as the REST rows.
- [ ] **Step 4: Run tests + `npm run typecheck` — expect PASS.**
- [ ] **Step 5: Manual check with two sessions**: `lina@` in the app, a branch reply inserted from the Supabase SQL editor (`booking_messages` with `sender_employee_id`) appears live; background the app 60 s, send from the other side, foreground → message appears; leave the screen and confirm in the Supabase dashboard that the channel count drops.
- [ ] **Step 6: Commit** — `feat(chat): booking chat on supabase realtime`

---

### Task 9: Notifications (list, badge, realtime) and push registration

**Files:**
- Modify: `src/features/notifications/api/notificationsApi.ts`, `schemas.ts`, `hooks/useNotifications.ts`, `screens/NotificationsScreen.tsx`, `utils/notificationVisual.ts`, `app/_layout.tsx`, `src/features/auth/hooks/useLogout.ts`
- Create: `src/features/notifications/api/mappers.ts`, `notificationsApi.test.ts`, `src/features/notifications/push.ts`

**Interfaces:**
- Produces:
  - `Notification = { id: string; title: string; message: string /* = body */; notification_type: NotificationType; store_id: string | null /* data.branch_id */; booking_id: string | null /* data.booking_id */; is_read: boolean /* read_at !== null */; created_at: string }`; `NotificationType` is the full backend enum. `notificationVisual` must return a sensible icon/colour for every **customer-relevant** type (`booking_created`, `booking_confirmed`, `booking_rescheduled`, `booking_cancelled`, `booking_reminder`, `pickup_ready`, `message_received`, `general`) and a generic fallback for any other value.
  - `getNotifications(params?: { is_read?: boolean; limit?: number }): Promise<Notification[]>`; `getUnreadNotificationCount(): Promise<{ unread_count: number }>`; `markNotificationRead(id: string): Promise<void>`; `markAllNotificationsRead(): Promise<void>` (`update({ read_at: now }).is('read_at', null)`); `useNotificationsRealtime(): void` (subscribes to `INSERT` on `notifications`, invalidates list + count; removed on sign-out).
  - `registerForPush(): Promise<void>` — requests permission, `Notifications.getExpoPushTokenAsync({ projectId })`, then `rpc('register_push_token', { p_token, p_platform: 'ios' | 'android' | 'web', p_app: 'customer' })`; a failure (simulator, denied permission) is logged, never thrown.

- [ ] **Step 1: Check G3**: run `select policyname, cmd from pg_policies where tablename = 'notifications'` via the Supabase MCP `execute_sql`. If there is no `DELETE` policy, remove `deleteNotification` and the swipe-to-delete UI in this task and record it in the PR description; otherwise implement it with a zero-row check.
- [ ] **Step 2: Write failing tests**: mapper pulls `branch_id`/`booking_id` out of `data` and tolerates `data: null`; `read_at` set → `is_read:true`; unread count comes from a head count; `markAllNotificationsRead` filters on `read_at is null`; `markNotificationRead` throws on zero rows (Review Focus 3); `notificationVisual` has a non-empty result for every type in the enum (loop over the generated enum so a new backend value fails the test, not the user).
- [ ] **Step 3: Run `npx jest src/features/notifications` — expect FAIL.**
- [ ] **Step 4: Implement**, then mount `useNotificationsRealtime` and `registerForPush` in `app/_layout.tsx` behind the signed-in guard, with the channel and listeners torn down in `useLogout` (Review Focus 5). Handle notification taps: `data.booking_id` → the booking detail route, else `data.branch_id` → the venue route.
- [ ] **Step 5: Run tests + `npm run typecheck` — expect PASS.**
- [ ] **Step 6: Manual check**: insert a notification row for `lina@` from the SQL editor → badge and list update live without refresh; mark all read clears the badge; sign out and in as `youssef@` and confirm no `lina@` rows or badge remain.
- [ ] **Step 7: Push needs a build to verify.** `expo-notifications` is already linked and the plugin is in `app.config.ts`, but whether the current dev binary has the iOS push entitlement is unknown. **Do not start an EAS build.** Verify the JS path (token registration is skipped gracefully on the simulator), and ask Omar to approve a build when they want end-to-end push tested on a device.
- [ ] **Step 8: Commit** — `feat(notifications): notifications, realtime badge and push token registration`

---

### Task 10: Offers and contact support

**Files:**
- Modify: `src/features/home/api/homeApi.ts` (`getHomeOffers`), `schemas.ts`, `src/features/home/components/DealCard.tsx`, `src/features/home/screens/HomeScreen.tsx` (`deals`), `src/features/support/api/supportApi.ts`, `schemas.ts`
- Create: `src/features/home/api/homeApi.test.ts`, `src/features/support/api/supportApi.test.ts`

**Interfaces:**
- Produces:
  - `HomePageOffer` keeps its field names where possible: `id: string`, `store_id: string`, `store_name`, `store_rating`, `description`, `offer_image` (public URL), `original_price`, `discounted_price` (= `offer_price`), `discount_percentage` (computed: `Math.round((1 - offer/original) * 100)`, `null` when `original_price` is falsy), `valid_from`, `valid_to`, `category_id`, `currency` (new, from the branch).
  - `getHomeOffers(): Promise<HomePageOffer[]>` — `from('offers').select('*, branch:branch_cards(business_name, branch_name, logo_path, rating_avg, currency)')`; the backend already returns only offers running today for customers.
  - `createSupportTicket({ subject, message }): Promise<SupportTicket>` — inserts `{ app: 'customer', subject, message }`; `getSupportTickets()` lists own, newest first.

- [ ] **Step 1: Check what `offers.category_id` references** in `database.types.ts` (store `categories` vs `offer_categories`) and fix the `HomeScreen` `deals` filter accordingly; if it is `offer_categories`, add a second query for those and filter on that instead of the store category.
- [ ] **Step 2: Write failing tests**: percentage rounding (`300 → 240` is `20`); `original_price: null` gives `discount_percentage: null` and does not throw; `offer_image` goes through `publicUrl`; support insert carries `app:'customer'`.
- [ ] **Step 3: Run `npx jest src/features/home src/features/support` — expect FAIL**, implement, rerun — expect PASS; run `npm run typecheck`.
- [ ] **Step 4: Manual check**: deals rail on Home with a seeded offer, Contact Us ticket appears in `support_tickets`.
- [ ] **Step 5: Commit** — `feat(home): offers and support tickets on supabase`

---

### Task 11: Remove the legacy client and verify end to end

**Files:**
- Delete: `src/lib/api/client.ts`, `src/lib/api/zodFetch.ts`, `src/features/booking/utils/apiError.ts`, `src/features/activity/api/teamApi.ts`
- Modify: `package.json` (remove `axios`), `src/lib/config.ts` (remove `apiBaseUrl`), `app.config.ts` (`extra.apiBaseUrl`), `.env.example`, `eas.json` (any `EXPO_PUBLIC_API_BASE_URL`), `src/lib/api/` (new `parseOrReport` replacing `validateResponse` for the Zod-validated Edge Function responses), stale `customer-app-api-map.md` comments

- [ ] **Step 1: Prove nothing references the old client**: `grep -rnE "apiClient|from 'axios'|isAxiosError|apiBaseUrl|/api/v1" src app app.config.ts eas.json .env.example` returns nothing.
- [ ] **Step 2: Delete and clean up** the files above; `npm uninstall axios`. Replace `validateResponse` (took an `AxiosResponse`) with `parseOrReport<T>(schema: ZodType<T>, data: unknown, context: string): T` — same behaviour: throw in dev, `Sentry.captureMessage` and pass through in production.
- [ ] **Step 3: Run `npm run typecheck && npm run lint && npm test` — expect all PASS with no warnings about unknown Jest keys.**
- [ ] **Step 4: Full manual pass on a simulator as `lina@slotify.dev` and, for Warsaw, `zofia@slotify.dev`**: sign-in → Home → search → venue → book (specialist, capacity, multi-service) → Activity → reschedule → cancel → chat both directions → notification badge → review → favourites → contact support → delete account (on a throwaway Google/Apple test login, not a demo account). Note every deviation.
- [ ] **Step 5: Update Notion `SLT-15`** (it is one combined task, area "Partner web"): add a "Customer app" row/notes with the result. Only after Omar confirms.
- [ ] **Step 6: Commit** — `chore: remove legacy FastAPI client`

---

## Deferred (not in this plan, deliberately)

- **Avatar upload** — needs `expo-image-picker` (native → new build). Storage path is `avatars/{user_id}/…`; wire it when a build is approved.
- **NDJSON availability streaming** (`expo/fetch`) for progressive slot rendering — only if `stream=0` latency proves slow.
- **Promoted branches rail** (`promoted_branch_cards`) — Home has no such section today.
- **Renaming routes/screens from store → branch** (`venue/[storeId]`, `booking/[storeId]`) — mechanical, separate PR.
- **Backend gaps G1–G5** above, once the backend team responds.

## Self-Review

- **Spec coverage:** every section of the guide the customer app touches maps to a task — setup/types (0), sign-in/profile/delete (2), §5 customer reads (3, 4, 5), availability/book/reschedule (6), reviews (7), realtime chat (8), notifications/push (9), §12 home/support (10), errors (0), times/money/enums (1, 4, 10). Sections 11 (operations), 13 (platform admin) and the partner-only parts of 3–5 are out of scope for this app by design.
- **Review Focus:** all five have a pinned test (1: Task 1/5; 2: Task 6; 3: Tasks 2/3/7/9; 4: Task 2; 5: Tasks 8/9).
- **Type consistency:** `ApiError`/`callFunction` (Task 0) are the only error/transport primitives used afterwards; `toStore` (3) is reused by 5 and 10; `VenueReview` (4) by 7; booking item `id: string` (5) is what `rescheduleBookingService` takes (6); `BookingMessage.message` keeps the screen's field name (8).
- **Honest limits:** the app has no tests today, so only the API/mapper layer is unit-tested; screens, Realtime and Hermes `Intl` behaviour are verified manually against the demo project. Several steps say "read X first" where a screen's exact use of a field was not inspected during planning (`SlotGrid`, `SearchScreen`, `OrderChatScreen`); those are deliberate, not omissions.
