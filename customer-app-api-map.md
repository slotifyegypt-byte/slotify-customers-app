# Slotify Customer App — Screen → API Map

Purpose: a screen-by-screen reference tying the customer mobile app design
(`Downloads/Slotify mobile app design`) to this backend's actual `/api/v1`
endpoints, so the app can be built against what really exists — sample
requests/responses included so there's no guessing about field names.

Base URL: all endpoints below are relative to `/api/v1`. Two independent JWT
auth tracks exist (`app/core/security.py`): **customer auth** (bearer token,
`sub` = customer email) and **store/partner auth** (bearer token, `sub` =
employee email, `store_id` in claims). The customer app only ever uses
customer auth, plus a handful of fully public GET endpoints, plus a couple
of endpoints that accept either (the team preview, §5, and order chat, §10).
"Public" below means no `Authorization` header required.

Status legend: ✅ exists and fits · ⚠️ exists but shape doesn't quite fit ·
❌ does not exist (gap).

**Changes in this revision** (product direction from Omar, implemented in
this repo, not just documented):
- Booking now branches on a new `Service.requires_specialist` flag instead
  of forcing every booking through a specialist picker. Barbers/salons/spa
  keep the specialist flow; car wash, car repair, and tailoring drop-off use
  a new **capacity-based** flow (§0).
- `GET /stores/{store_id}/team` ("meet the team") is now a real, secured
  endpoint (§5).
- Forgot-password is dropped from the customer app's scope entirely — see
  §1 — and Live Queue is dropped from the design scope for now.
- **Order Chat is now implemented** — per-booking messaging between a
  customer and the store, with REST send/list/read-tracking plus a
  WebSocket for live push (§10).

---

## 0. Booking engines — specialist vs. capacity

The design implies several different venue "engines." Two are now real,
backend-supported concepts; the rest remain gaps (tracked at the end of this
section) and are out of scope until flagged otherwise.

### 0.1 Specialist-based (barbers, salons, spa)

`Service.requires_specialist = true` (the default). The customer picks a
specific employee (or "Anyone available", resolved to a specific employee
client-side before submitting), and availability/conflict-checking is keyed
by `employee_id`. This is the flow that already existed — unchanged.

### 0.2 Capacity-based (car wash, car repair, tailoring drop-off)

`Service.requires_specialist = false`. **No specialist picker is shown in
the app for these services at all** — car washes don't have "your barber,"
they have bays/lifts/intake capacity. Instead, each such service carries
`max_concurrent_bookings: int` — how many bookings it can accept for the
same overlapping time slot (e.g. "5 cars at 1 PM"). Availability and booking
creation both check remaining capacity instead of an employee's calendar.

This is now implemented end-to-end:
- `app/db/models.py` — `Service.requires_specialist` (bool, default `true`),
  `Service.max_concurrent_bookings` (nullable int); `BookingService.employee_id`
  is now nullable.
- `GET /availability` branches on the service and returns a
  `booking_mode: "specialist" | "capacity"` field so the app knows which UI
  to render (see §6 for both response shapes).
- `POST /bookings` branches the same way: `employee_id` is optional per
  service slot, required only when that service's `requires_specialist` is
  `true`; for capacity services the server checks remaining capacity and
  returns `409` once a slot is full.
- Store/partner side sets `requires_specialist`/`max_concurrent_bookings`
  via the existing `POST/PUT /stores/{store_id}/services` endpoints (§6 has
  sample payloads for both service types).

**Tailoring drop-off uses this same capacity flow for the booking itself**
(dropping off an item is just "book an intake slot," no specialist to pick,
capacity = how many drop-offs the store can process at once). What's
*different* about tailoring — and still a gap, not built — is everything
that happens **after** that initial booking is created: the multi-stage
ticket (Dropped Off → In Progress → Fitting → Ready for Pickup) and
scheduling a fitting as a follow-up. Order chat, the other thing that used
to be listed here as tailoring-specific, is now built and is **not**
tailoring-specific — it works for any booking. See §0.3 and §10.

### 0.3 Still gaps (unimplemented, scoped for later)

| Gap | Blocks | Notes |
|---|---|---|
| Drop-off ticket stage tracking (Dropped Off / In Progress / Fitting / Ready) | Tailors' Ticket Tracker screen | The booking itself now works (capacity-based); there's no field anywhere to track which of the 4 stages an in-progress drop-off booking is in beyond the generic `pending/confirmed/cancelled/completed` status |
| Fitting follow-up scheduling | Tailors' "Schedule Fitting" card | No concept of one booking spawning a linked follow-up appointment |
| Onsite technician dispatch (mobile mechanic-style, at the customer's address) | Onsite screen | No customer `Address` model, no live technician-location/ETA tracking |
| Quote-pending / quote-approval | The one "Cairo Auto Care — 1240 EGP quote" example in `Track Order Flow.dc.html` | No quote model; open-ended repairs (where price isn't known until inspection) have nowhere to live |
| Booking **reschedule** endpoint | Appointment detail's "Reschedule" button | Only create/cancel/confirm/complete/status-update exist; today a reschedule is cancel + recreate |
| Live Queue | — | **Dropped from scope per product direction — do not build.** The Activity/Explore/queue-related design references to it should be ignored. |
| Chat photo attachments | Order Chat's attach-photo icon | Not built — the design's attach-photo icon isn't actually wired to anything in the prototype either (no `onClick`), so there's nothing functional to match yet |

None of these block shipping v1: barbers/salons/spa (specialist flow) and
car wash/car repair/basic tailoring drop-off (capacity flow) are both fully
bookable against real endpoints today, and every booking now has a working
chat thread regardless of engine (§10).

---

## 1. Onboarding (`Slotify Onboarding.dc.html`)

**Product direction: the customer app will only ever support Google, Apple,
or phone-number sign-in — no email+password.** The design's Login/Signup/
Forgot-Password screens (email+password) are **out of scope for the
customer app** and should not be built; ignore those three screens entirely.
(The backend's email+password endpoints still exist and remain in scope for
other consumers, e.g. testing or the partner dashboard's customer lookup
tooling — just not this app.) Because there's no email/password path, there
is also **no forgot-password need for this app** — nothing to implement.

| Screen | Action | Endpoint | Status |
|---|---|---|---|
| Sign In/Up — Continue with Google | social auth | `GET /customers/auth/google` → redirect → `GET /customers/auth/google/callback` → `POST /customers/auth/google/exchange` → `TokenResponse` | ✅ |
| Sign In/Up — Continue with Apple | social auth | — | ❌ No backend support for Apple Sign In at all |
| Sign In/Up — Continue with Phone → OTP screen | send/verify OTP, then issue a token | — | ❌ No OTP send/verify endpoint exists anywhere, despite an `OtpVerification` model + `OTPTypeEnum.PHONE_VERIFICATION` sitting unused in `app/db/models.py`, and no "phone login" token-issuing endpoint either. **Phone-based signup/login is planned ("in the future" per product direction) but not implementable today** — highest-priority gap for this app specifically, since Google/Apple/phone are the *only* three sign-in methods it will ever offer. |
| Login / Signup / Forgot Password (email+password) | — | — | **Out of scope for this app** — see note above |
| Location Priming / Notifications Priming | permission prompts | — | Device-native only, no backend call. Store the customer's choice locally |
| Location Disabled Recovery Modal | opens OS settings | — | Client-only |

#### Sample — Google sign-in exchange

```
POST /api/v1/customers/auth/google/exchange
Content-Type: application/json

{ "code": "a1b2c3d4-...-one-time-exchange-code-from-redirect" }
```
```json
200 OK
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in": 15
}
```

#### Sample — refresh

```
POST /api/v1/customers/refresh
Content-Type: application/json

{ "refresh_token": "eyJhbGciOi..." }
```
Response shape is the same `TokenResponse` as above.

---

## 2. Home (`isHome` root in `Slotify App.dc.html`)

| Element | Endpoint | Status |
|---|---|---|
| Greeting + location | `GET /customers/me` (name) + device geolocation | ✅ |
| Notification bell + unread dot | `GET /notifications/unread-count` | ✅ |
| Search bar | routes to Search screen | — |
| Category strip (barbers/salons/spa/carcare/tailors/repair) | `GET /store-categories` | ✅ — confirm the 6 seeded categories match these design keys exactly (the icon component only knows these 6 keys; anything else falls back to "barbers" styling) |
| "Next up" card (upcoming booking) | `GET /bookings/my-bookings?status=confirmed` (take soonest by `booking_date`) | ✅ |
| "Book again" rail | `GET /bookings/my-bookings?status=completed` (dedupe by store, most recent) | ✅. "Quick book" → maps to the **Rebook Sheet**, see §7 |
| Map preview (nearby pins) | `GET /stores/search/nearby?latitude=&longitude=&radius_km=&limit=` | ✅ |
| "Top rated near you" rail | `GET /search?latitude=&longitude=&rating=4` sorted by rating, or `GET /stores/search/nearby` sorted client-side | ✅ (no server-side "top rated" sort — sort client-side by `rating`) |
| **"Deals this week"** rail | `GET /offers?active_only=true` | ⚠️ works as a manual convention — see note below |

#### "Deals this week" — exactly how to wire it

`GET /offers?active_only=true` returns `HomePageOffer` rows whose
`valid_from <= today <= valid_to`. Store/admin side manages that window to
mean "this week" — there's no separate `is_featured` flag. **One API quirk
to know:** passing `category_id` **overrides** `active_only` entirely (the
service does `if category_id: ... elif active_only: ...`) — so "active
offers in a specific category" isn't a single call; either fetch by
`category_id` and filter the date window client-side, or fetch
`active_only=true` and filter by `category_id` client-side.

```
GET /api/v1/offers?active_only=true
```
```json
200 OK
[
  {
    "id": 14,
    "category_id": "b7e2b7b0-...-e2b3",
    "store_id": "1c9e3a2a-...-77fd",
    "store_name": "Fade Room Barbershop",
    "store_rating": 4.8,
    "description": "20% off all fades this week",
    "offer_image": "https://cdn.slotify.app/offers/fade-room-deal.jpg",
    "valid_from": "2026-09-01",
    "valid_to": "2026-09-07",
    "created_at": "2026-08-30T10:00:00Z"
  }
]
```

There's no discount/price field — `oldPrice`/`newPrice` shown in the design
must live in the free-text `description` or be baked into `offer_image`
until/unless structured fields are added (§9).

---

## 3. Explore (map tab)

| Element | Endpoint | Status |
|---|---|---|
| Map pins / clusters | `GET /stores/search/nearby?latitude=&longitude=&radius_km=` (cluster client-side by zoom) | ✅ |
| Category filter chip | same endpoint, filter client-side by `category_id`, or `GET /search?...` | ✅ |
| **Open now** filter chip | filter client-side on the `status` field | ✅ **confirmed real** — `status` is server-computed ("open"/"closed") from the store's weekly calendar + special-day overrides (`app/core/store_utils.py::get_store_status`), not a placeholder. No server-side `open_now=true` query param exists on any endpoint, so filter the returned list client-side. |
| Rating filter chip | `GET /search?...&rating=4` or filter client-side | ✅ |
| Bottom sheet (venue preview: call/directions/book) | `GET /stores/{store_id}` | ✅ |

#### Sample — nearby search

```
GET /api/v1/stores/search/nearby?latitude=30.06&longitude=31.22&radius_km=5&limit=20
```
```json
200 OK
[
  {
    "id": "1c9e3a2a-...-77fd",
    "name": "Fade Room Barbershop",
    "description": "Classic and modern cuts in Zamalek",
    "category_id": 1,
    "logo": "https://cdn.slotify.app/logos/fade-room.png",
    "address": "12 Shagaret El Dor St, Zamalek",
    "latitude": 30.0626,
    "longitude": 31.2197,
    "phone_country_code": "+20",
    "phone_number": "1002345678",
    "rating": 4.8,
    "share_link": "https://slotify.app/s/fade-room",
    "created_at": "2026-01-12T09:00:00Z",
    "status": "open",
    "distance_km": 1.24
  }
]
```

---

## 4. Search (`isSearch`) & Category Listing (`isCategory`)

| Element | Endpoint | Status |
|---|---|---|
| Search results | `GET /search?latitude=&longitude=&q=&distance=&rating=&availability=&limit=&offset=` | ✅ |
| Recent / Trending chips | — | ❌ No search-history or trending-terms endpoint. Store "recent" client-side; hardcode "trending" for v1 |
| Category listing (e.g. "Barbers near you") | `GET /search?...` filtered client-side to one `store_category_id`, or `GET /stores?category_id=` if supported — verify | ✅/⚠️ |

#### Sample — search

```
GET /api/v1/search?latitude=30.06&longitude=31.22&q=barber&distance=10KM&rating=4&limit=20&offset=0
```
```json
200 OK
{
  "stores": [
    {
      "store_id": "1c9e3a2a-...-77fd",
      "store_name": "Fade Room Barbershop",
      "store_address": "12 Shagaret El Dor St, Zamalek",
      "store_rating": 4.8,
      "store_distance_km": 1.24,
      "store_logo": "https://cdn.slotify.app/logos/fade-room.png",
      "store_category_id": 1,
      "latitude": 30.0626,
      "longitude": 31.2197,
      "status": "open"
    }
  ],
  "total_count": 1,
  "limit": 20,
  "offset": 0,
  "customer_latitude": 30.06,
  "customer_longitude": 31.22
}
```

---

## 5. Venue Detail (`isVenue`)

| Element | Endpoint | Status |
|---|---|---|
| Header (name, category, rating, distance, open/closed, photos) | `GET /stores/{store_id}` | ✅ |
| Favorite toggle | `POST /favourites`, `DELETE /favourites/{store_id}`, `GET /favourites/check/{store_id}` | ✅ |
| Photo gallery | `GET /stores/{store_id}/galleries` | ✅ |
| **"Meet the team" strip** | `GET /stores/{store_id}/team` | ✅ **now implemented and secured** — see below |
| Services tab (grouped by category, multi-select cart) | `GET /stores/{store_id}/services`, `GET /stores/{store_id}/service-categories` | ✅ — response now also carries `requires_specialist`/`max_concurrent_bookings` per service (§0), which the app should use to decide whether to render a specialist picker at all for that service |
| About tab — hours | `GET /stores/{store_id}/calendar` (weekly), `GET /stores/{store_id}/special-days` (exceptions) | ✅ |
| About tab — amenities | — | ❌ No amenities field/model anywhere on `Store` |
| Reviews tab — summary + list | `GET /reviews/store/{store_id}/stats`, `GET /reviews/store/{store_id}` (paginated) | ✅. Rating distribution bars (5★/4★/…) — confirm `stats` includes a breakdown or compute client-side from the full list |
| Write a review | `POST /reviews` | ⚠️ works, but: no `booking_id` on `ReviewCreate` (so "Verified booking" badges/booking-picker have nothing to bind to), no photo field, no per-specialist rating field |

#### "Meet the team" — new endpoint

`GET /stores/{store_id}/team` requires **authentication** (no anonymous
access to staff data) but accepts **either** a customer token or a token
from an employee of that same store — implemented via a dual-auth
dependency (`get_current_customer_or_store_employee` in
`app/core/security.py`) that resolves the JWT's `sub` email against the
customer table first, then the employee table. Any authenticated customer
can view any store's team; an employee token is only accepted for their own
store. The response is a PII-free subset (`StoreEmployeeTeamRead`) — no
email, phone, or date of birth.

```
GET /api/v1/stores/1c9e3a2a-...-77fd/team
Authorization: Bearer <customer-or-same-store-employee-token>
```
```json
200 OK
[
  { "id": "6e2a...-01", "first_name": "Karim", "last_name": null, "profile_picture": "https://cdn.slotify.app/staff/karim.jpg", "role_name": "Barber" },
  { "id": "6e2a...-02", "first_name": "Mostafa", "last_name": null, "profile_picture": null, "role_name": "Barber" }
]
```
A customer token from an unrelated account still succeeds (team rosters
aren't scoped per-customer); an employee token from a *different* store
gets `403`.

#### Sample — services list (mixed specialist/capacity store)

```
GET /api/v1/stores/{store_id}/services
```
```json
200 OK
[
  {
    "id": "s1-uuid",
    "store_id": "{store_id}",
    "name": "Classic haircut",
    "description": "Scissor cut and finish",
    "category_id": "cat-uuid",
    "service_image": null,
    "duration_minutes": 30,
    "price": 150.0,
    "price_currency": "EGP",
    "price_symbol": "E£",
    "requires_specialist": true,
    "max_concurrent_bookings": null,
    "created_at": "2026-01-12T09:00:00Z",
    "updated_at": null
  }
]
```
For a car-wash store, the same shape but `"requires_specialist": false,
"max_concurrent_bookings": 5` — the app should skip the specialist step
entirely for this service.

---

## 6. Service Booking Configuration & Booking Sheet Overlay

| Element | Endpoint | Status |
|---|---|---|
| Specialist picker (specialist-mode services only) | `GET /stores/{store_id}/services/{service_id}/employees` | ✅ — **skip this step in the UI when `service.requires_specialist` is `false`** |
| Date/time slot grid | `GET /availability?store_id=&service_id=&date=&employee_id=` | ✅ — response shape now depends on `booking_mode`, see below |
| Vehicle picker (car-care) | — | ❌ still a gap — see §0.3. Not needed to *book* the slot (capacity mode doesn't require a vehicle), only relevant if you want to show "which of my cars is this for" as a customer-side label. There's no `Vehicle` model to store that in yet. |
| Address picker (onsite flow) | — | ❌ gap — see §0.3 |
| Item list / photo tagging (tailoring drop-off) | — | ❌ gap — see §0.3 |
| Notes field | — | ⚠️ `BookingCreate`/`BookingServiceCreate` still have no `notes` field |
| "Notify me if a sooner slot frees up" | — | ❌ no waitlist mechanism |
| Confirm Booking | `POST /bookings` | ✅ — request shape now varies by service type, see below |

#### Sample — availability, specialist mode

```
GET /api/v1/availability?store_id={store_id}&service_id={service_id}&date=2026-09-10
```
```json
200 OK
{
  "store_id": "{store_id}",
  "service_id": "{service_id}",
  "date": "2026-09-10",
  "service_duration_minutes": 30,
  "booking_mode": "specialist",
  "employees": [
    {
      "employee_id": "6e2a...-01",
      "employee_name": "Karim",
      "service_id": "{service_id}",
      "available_slots": [
        { "start_time": "2026-09-10T13:00:00", "end_time": "2026-09-10T13:30:00", "employee_id": "6e2a...-01", "employee_name": "Karim", "capacity_total": null, "capacity_booked": null, "capacity_remaining": null, "is_available": true, "time_slot_str": "01:00 PM" }
      ]
    }
  ],
  "slots": []
}
```

#### Sample — availability, capacity mode (car wash)

```
GET /api/v1/availability?store_id={carwash_store_id}&service_id={exterior_wash_service_id}&date=2026-09-10
```
```json
200 OK
{
  "store_id": "{carwash_store_id}",
  "service_id": "{exterior_wash_service_id}",
  "date": "2026-09-10",
  "service_duration_minutes": 30,
  "booking_mode": "capacity",
  "employees": [],
  "slots": [
    { "start_time": "2026-09-10T13:00:00", "end_time": "2026-09-10T13:30:00", "employee_id": null, "employee_name": null, "capacity_total": 5, "capacity_booked": 2, "capacity_remaining": 3, "is_available": true, "time_slot_str": "01:00 PM" }
  ]
}
```
No specialist picker should be shown for this service — go straight from
service selection to this slot grid. Passing `employee_id` in the query for
a capacity-mode service returns `400`.

Note both modes only return **available** slots (same as before) — a fully
booked slot simply isn't in the list, it isn't returned with
`is_available: false`. If the design's grey/struck-through "taken" slot
styling matters, that needs a follow-up change to return the full set of
slots either way; not built yet, low priority.

#### Sample — create booking, specialist mode

```
POST /api/v1/bookings
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "store_id": "1c9e3a2a-...-77fd",
  "booking_services": [
    {
      "service_id": "s1-uuid",
      "employee_id": "6e2a...-01",
      "booking_start_time": "2026-09-10T13:00:00+02:00",
      "booking_end_time": "2026-09-10T13:30:00+02:00"
    }
  ]
}
```

#### Sample — create booking, capacity mode (no employee_id)

```
POST /api/v1/bookings
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "store_id": "sparkle-auto-uuid",
  "booking_services": [
    {
      "service_id": "exterior-wash-uuid",
      "booking_start_time": "2026-09-10T13:00:00+02:00",
      "booking_end_time": "2026-09-10T13:30:00+02:00"
    }
  ]
}
```
```json
201 Created
{
  "id": "bk-uuid",
  "customer_id": "cust-uuid",
  "store_id": "sparkle-auto-uuid",
  "store_name": "Sparkle Auto Spa",
  "store_logo": "https://cdn.slotify.app/logos/sparkle-auto.png",
  "store_address": "Corniche El Nil, Maadi",
  "store_rating": 4.6,
  "booking_status": "pending",
  "total_price": 120.0,
  "booking_date": "2026-09-10T13:00:00+02:00",
  "booking_date_title": "Today Afternoon",
  "booking_date_str": "10 Sep. 2026",
  "booking_hour_str": "1:00 PM",
  "booking_services_str": "Exterior wash",
  "created_at": "2026-09-04T11:02:00Z",
  "updated_at": null,
  "booking_services": [
    {
      "id": 501,
      "booking_id": "bk-uuid",
      "service_id": "exterior-wash-uuid",
      "employee_id": null,
      "booking_start_time": "2026-09-10T13:00:00+02:00",
      "booking_end_time": "2026-09-10T13:30:00+02:00",
      "booking_status": "pending",
      "total_price": 120.0,
      "service_name": "Exterior wash",
      "service_image": null,
      "created_at": "2026-09-04T11:02:00Z",
      "updated_at": null
    }
  ]
}
```
If the slot has reached `max_concurrent_bookings` for that overlapping time
range, this call instead returns:
```json
409 Conflict
{ "detail": "Time slot 2026-09-10 13:00:00+02:00 to 2026-09-10 13:30:00+02:00 has reached its capacity of 5 bookings for Exterior wash" }
```

#### Sample — store/partner side: creating a capacity-based service

```
POST /api/v1/stores/{store_id}/services
Authorization: Bearer <owner-or-manager-token>
Content-Type: application/json

{
  "name": "Exterior wash",
  "description": "A thorough hand wash and dry.",
  "category_id": "carcare-cat-uuid",
  "service_image": null,
  "duration_minutes": 30,
  "price": 120,
  "requires_specialist": false,
  "max_concurrent_bookings": 5
}
```
Omitting `max_concurrent_bookings` (or setting it to `0`/`null`) while
`requires_specialist` is `false` is rejected with `422` — capacity is
mandatory for non-specialist services. Omitting `requires_specialist`
defaults to `true` (unchanged specialist behavior), matching every service
created before this change.

---

## 7. Confirmation Overlay & Rebook Sheet

| Element | Endpoint | Status |
|---|---|---|
| Confirmation summary | Response of `POST /bookings` (`BookingRead`, shown above) | ✅ |
| Rebook (quick repeat of a past booking) | `POST /bookings` again with the same `service_id`(s), new time from `GET /availability` | ✅ — no dedicated "rebook" endpoint needed, it's a normal create with pre-filled defaults. For a capacity-mode service, rebook simply omits `employee_id`. |

---

## 8. Activity (`isActivity`)

| Element | Endpoint | Status |
|---|---|---|
| Active tab | `GET /bookings/my-bookings?status=confirmed` (and `pending`) | ✅ |
| Past tab | `GET /bookings/my-bookings?status=completed` and `status=cancelled` | ✅ |
| Badge count on bottom nav | derive client-side from active-list length | ⚠️ clarify whether the design intends this to reflect active bookings (visual placement suggests yes) or unread notifications |

---

## 9. Activity Detail screens

| Screen | Endpoint | Status |
|---|---|---|
| **Appointment** (specialist-mode bookings) — directions/reschedule/cancel | `GET /bookings/{booking_id}`; `POST /bookings/{booking_id}/cancel` | ✅ for view+cancel. **Reschedule has no endpoint** (❌, §0.3) |
| **"Booking" detail for capacity-mode bookings** (car wash, basic tailoring drop-off) | same `GET /bookings/{booking_id}` | ✅ — `booking_services[].employee_id` is simply `null`; render without a specialist row |
| Cancel modal | `POST /bookings/{booking_id}/cancel` (body `{ "reason": "..." }`) | ✅ |
| **Order Chat** ("Message" button on any booking detail) | `GET/POST /bookings/{booking_id}/messages` (+ WebSocket for live push) | ✅ **now implemented** — see §10 for the full endpoint set and sample I/O |
| Ticket Tracker, Onsite | — | ❌ gaps, see §0.3 |
| ~~Live Queue~~ | — | **removed from scope**, do not build |

---

## 10. Order Chat (booking messages)

Per-booking messaging between the customer who owns a booking and any
employee of the store that owns it (not a specific specialist) — this is
the backend for the design's Order Chat screen. It's built generically
around `booking_id`, so it works for **any** booking regardless of engine
(specialist or capacity), not just the tailoring drop-off flow the design
happens to show it from — an Appointment detail screen can wire up the same
"Message" button.

| Element | Endpoint | Status |
|---|---|---|
| Message thread (list, oldest first) | `GET /bookings/{booking_id}/messages` | ✅ |
| Send message | `POST /bookings/{booking_id}/messages` | ✅ |
| Mark thread read | `PUT /bookings/{booking_id}/messages/read` | ✅ |
| Unread count (e.g. for a badge) | `GET /bookings/{booking_id}/messages/unread-count` | ✅ |
| Live delivery | `WS /bookings/{booking_id}/messages/ws` | ✅ receive-only push — sending always goes through the REST `POST` above, never over the socket |
| Photo attachments | — | ❌ not built, see §0.3 |

Auth: the same dual customer-or-employee pattern as "meet the team" (§5) —
a customer can only access their own booking's thread; an employee only a
thread for a booking belonging to their own store (any employee of that
store, not a specific one).

#### Sample — send a message

```
POST /api/v1/bookings/{booking_id}/messages
Authorization: Bearer <customer-token>
Content-Type: application/json

{ "message": "Hi, is my suit ready for pickup yet?" }
```
```json
201 Created
{
  "id": 42,
  "booking_id": "bk-uuid",
  "sender_type": "customer",
  "sender_name": "Omar",
  "message": "Hi, is my suit ready for pickup yet?",
  "is_read": false,
  "created_at": "2026-09-06T14:02:00Z"
}
```
`message` is trimmed server-side and must be 1–2000 characters; an
empty/whitespace-only message is rejected with `422`.

#### Sample — list thread (store side)

```
GET /api/v1/bookings/{booking_id}/messages?limit=50
Authorization: Bearer <employee-token>
```
```json
200 OK
[
  { "id": 41, "booking_id": "bk-uuid", "sender_type": "store", "sender_name": "Mona", "message": "Your suit is being pressed now, ready by 5pm.", "is_read": true, "created_at": "2026-09-06T13:40:00Z" },
  { "id": 42, "booking_id": "bk-uuid", "sender_type": "customer", "sender_name": "Omar", "message": "Hi, is my suit ready for pickup yet?", "is_read": false, "created_at": "2026-09-06T14:02:00Z" }
]
```
`sender_type` (`"customer"` vs `"store"`) is what the app should key bubble
alignment/color off of — `"customer"` always means the booking's own
customer, `"store"` means any employee of that store. `sender_name` is a
display-only convenience, not an identity to branch logic on.

#### Sample — unread count / mark read

```
GET /api/v1/bookings/{booking_id}/messages/unread-count
```
```json
200 OK
{ "booking_id": "bk-uuid", "unread_count": 1 }
```
This counts messages sent by the *other* side that the caller hasn't read
yet — a customer calling this sees unread store messages, an employee
calling it sees unread customer messages.
```
PUT /api/v1/bookings/{booking_id}/messages/read
```
```json
200 OK
{ "marked_read": 1 }
```

#### Sample — live delivery (WebSocket)

```
WS /api/v1/bookings/{booking_id}/messages/ws?token=<access_token>
```
Pass the access token as a `token` query parameter (needed for browser
WebSocket clients, which can't set custom headers on the handshake) — a
normal `Authorization: Bearer <token>` header also works for native/mobile
clients that can set one. Once connected and authorized against the
booking, the client is pushed a JSON `BookingMessageRead` payload (same
shape as the REST samples above) every time anyone posts a new message via
the REST `POST` endpoint — **nothing is ever sent from the client over the
socket itself**, this connection is receive-only.

One operational caveat worth knowing: this broadcasts only to connections
held by the single process handling them — there's no Redis (or similar)
pub/sub behind it, matching how the pre-existing (and, until now, entirely
unwired) availability WebSocket manager in `app/core/websocket_manager.py`
already worked. Fine for a single running instance; a multi-instance
deployment would need a shared layer added to fan out broadcasts across
replicas.

---

## 11. Profile (`isProfile`) and sub-screens

| Screen | Endpoint | Status |
|---|---|---|
| Profile header (photo/name/email) | `GET /customers/me` | ✅ |
| Favourites count | `GET /favourites?limit=1` (read total) | ⚠️ confirm the endpoint returns a total count, not just a page |
| Favourites screen | `GET /favourites` (paginated), `DELETE /favourites/{store_id}` | ⚠️ `FavouriteRead` is `{id, customer_id, store_id, created_at}` only — **no joined store name/photo/rating/distance** (confirmed from the schema directly). The app must call `GET /stores/{store_id}` per favourite to render the grid, or this needs a join added server-side. |
| My Reviews screen | `GET /reviews/customer/{customer_id}`; edit → `PUT /reviews/{review_id}`; delete → `DELETE /reviews/{review_id}` | ✅ |
| Notification Settings toggles | — | ❌ no preferences model |
| Language (English/Arabic, RTL) | — | Client-only |
| Help & FAQ | — | Static content, no endpoint needed |
| Contact Us | — | ❌ no support-ticket endpoint; "Call Support" is a `tel:` link only |
| Edit Profile — name/email/phone | `PUT /customers/me` | ⚠️ works for name/gender/dob/phone, but **overwrites email/phone directly with no OTP/verification step** — the design's masked-phone OTP screen and "send verification link" email modal have no backend support (same root cause as §1's missing OTP endpoints) |
| Logout | `POST /customers/logout` | ⚠️ client-side token discard only, no server-side session invalidation |
| Delete Account | `DELETE /customers/me` | ✅ |

#### Sample — favourites list + per-row store join

```
GET /api/v1/favourites?limit=20&offset=0
```
```json
200 OK
[ { "id": 9, "customer_id": "cust-uuid", "store_id": "1c9e3a2a-...-77fd", "created_at": "2026-08-20T10:00:00Z" } ]
```
Then per row: `GET /stores/1c9e3a2a-...-77fd` for name/photo/rating/distance.

---

## 12. Notifications (`isNotifications`)

| Element | Endpoint | Status |
|---|---|---|
| List (grouped Today/Yesterday/Earlier) | `GET /notifications` (paginated) — group client-side by `created_at` | ✅ |
| Mark all read | `PUT /notifications/mark-all-read` | ✅ |
| Swipe to delete | `DELETE /notifications/{id}` | ✅ |
| Tap notification → deep link | — | ⚠️ **confirmed gap**: `NotificationRead` is `{id, customer_id, title, message, is_read, created_at}` — no `booking_id`/`store_id` reference field, so there is nothing to deep-link on today. Needs a reference field added if tap-to-open is required. |
| Push notifications | — | ❌ no device/push-token registration anywhere (in-app poll-only inbox) |

#### Sample

```
GET /api/v1/notifications?is_read=false&limit=20
```
```json
200 OK
[ { "id": 101, "customer_id": "cust-uuid", "title": "Appointment reminder", "message": "Fade Room Barbershop · today at 4:30 PM", "is_read": false, "created_at": "2026-09-04T09:00:00Z" } ]
```

---

## 13. Bottom Nav

Home / Explore / Activity / Profile — pure client-side routing, no API.

---

## 14. Cross-cutting gaps, prioritized

1. **Phone OTP sign-in** — the only *other* onboarding path besides
   Google/Apple, and product direction says it's coming; nothing backs it
   today (§1). Highest priority now that email/password is out of scope.
2. **Tailoring's remaining post-booking flow**: ticket stage tracking and
   fitting follow-up scheduling (§0.3) — order chat itself is done (§10).
3. **Onsite technician dispatch** (customer `Address` model + live
   ETA/location) (§0.3).
4. **Push notification registration** — in-app inbox and order chat both
   work, but nothing reaches the user outside the app when it's closed.
5. **Booking reschedule endpoint** — currently cancel + recreate only.
6. **Email/phone change verification** on Edit Profile — currently a bare
   overwrite with no OTP/confirmation step (shares its fix with #1).
7. **Favourites → store join** — either add store fields to `FavouriteRead`
   or accept the N+1 client-side call pattern for v1.
8. **Review-booking linkage + photos + per-specialist rating** — needed for
   "Verified booking" badges, photo reviews, specialist-level ratings.
9. **Notification deep-link reference field** (`booking_id`/`store_id` on
   `NotificationRead`).
10. Minor: booking notes field, waitlist/"notify me" mechanism, amenities on
    Store, contact-us endpoint, structured discount fields on offers,
    quote-pending flow for open-ended repairs, "taken" (vs. simply omitted)
    slots in `GET /availability`, chat photo attachments, multi-instance
    fan-out for the chat WebSocket.

**Explicitly dropped from scope, not gaps to track:** Live Queue screens,
forgot-password (customer app only — no email+password sign-in at all),
email+password Login/Signup screens for the customer app.

Home, Explore, Search, Venue Detail (services/about/reviews/team), both
booking flows (specialist and capacity), Activity, Order Chat, Favourites,
My Reviews, and core Profile are all buildable today against real, verified
endpoints.
