// ── Auth ──────────────────────────────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface GoogleExchangeRequest {
  code: string;
}

// ── Categories & Home ─────────────────────────────────────────────────────────
export interface StoreCategory {
  key: string;
  label: string;
  icon_url: string | null;
}

export interface HomePageOffer {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  store_id: number | null;
  deep_link: string | null;
}

// ── Stores ────────────────────────────────────────────────────────────────────
export interface NearbyStore {
  id: number;
  name: string;
  category: string;
  category_key: string;
  cover_image_url: string | null;
  rating: number;
  review_count: number;
  distance_km: number;
  is_open: boolean;
  is_favourite: boolean;
}

export interface SearchStore {
  id: number;
  name: string;
  category: string;
  category_key: string;
  cover_image_url: string | null;
  rating: number;
  review_count: number;
  distance_km: number | null;
  is_open: boolean;
}

export interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SearchStore[];
}

export interface StoreTeamMember {
  id: number;
  name: string;
  role: string;
  avatar_url: string | null;
  rating: number;
  review_count: number;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: string;
  currency: string;
  requires_specialist: boolean;
  category_key: string | null;
}

export interface ReviewStats {
  average: number;
  count: number;
  breakdown: Record<string, number>;
}

export interface Review {
  id: number;
  customer_name: string;
  customer_avatar_url: string | null;
  rating: number;
  body: string;
  created_at: string;
}

export interface WorkingHours {
  day: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

export interface StoreDetail {
  id: number;
  name: string;
  category: string;
  category_key: string;
  cover_image_url: string | null;
  gallery_image_urls: string[];
  description: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  working_hours: WorkingHours[];
  rating: number;
  review_count: number;
  is_open: boolean;
  is_favourite: boolean;
  services: Service[];
  team: StoreTeamMember[];
  review_stats: ReviewStats;
}

// ── Favourites ────────────────────────────────────────────────────────────────
export interface FavouriteRead {
  id: number;
  store: NearbyStore;
  created_at: string;
}

// ── Availability ──────────────────────────────────────────────────────────────
export type BookingMode = 'specialist' | 'capacity';

export interface AvailabilitySlot {
  time: string;
  available: boolean;
}

export interface AvailabilityEmployee {
  employee_id: number;
  employee_name: string;
  slots: AvailabilitySlot[];
}

export interface AvailabilityResponse {
  mode: BookingMode;
  date: string;
  employees?: AvailabilityEmployee[];
  slots?: AvailabilitySlot[];
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_queue'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface BookingServiceCreate {
  service_id: number;
  employee_id?: number;
}

export interface CreateBookingRequest {
  store_id: number;
  date: string;
  time: string;
  services: BookingServiceCreate[];
  notes?: string;
}

export interface BookingServiceRead {
  service_id: number;
  service_name: string;
  employee_id: number | null;
  employee_name: string | null;
  duration_minutes: number;
  price: string;
  currency: string;
}

export interface Employee {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface BookingRead {
  id: number;
  store_id: number;
  store_name: string;
  store_cover_image_url: string | null;
  store_category_key: string;
  status: BookingStatus;
  date: string;
  time: string;
  services: BookingServiceRead[];
  total_price: string;
  currency: string;
  queue_position: number | null;
  ticket_number: string | null;
  notes: string | null;
  created_at: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface BookingMessage {
  id: number;
  booking_id: number;
  sender_type: 'customer' | 'store';
  sender_name: string;
  body: string;
  sent_at: string;
}

export interface SendMessageRequest {
  body: string;
}

export interface MessageUnreadCountResponse {
  unread_count: number;
}

export interface MarkReadResponse {
  marked_read: number;
}

// ── Customer Profile ──────────────────────────────────────────────────────────
export interface CustomerProfile {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  preferred_language: 'en' | 'ar';
  created_at: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface NotificationRead {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
