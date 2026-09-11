import { apiClient } from './client';
import type {
  TokenResponse,
  GoogleExchangeRequest,
  StoreCategory,
  HomePageOffer,
  NearbyStore,
  SearchResponse,
  StoreDetail,
  StoreTeamMember,
  Service,
  FavouriteRead,
  Review,
  AvailabilityResponse,
  CreateBookingRequest,
  BookingRead,
  BookingMessage,
  SendMessageRequest,
  MessageUnreadCountResponse,
  MarkReadResponse,
  CustomerProfile,
  NotificationRead,
  PaginatedResponse,
} from './types';

// ── §1 Auth ───────────────────────────────────────────────────────────────────

export function exchangeGoogleToken(payload: GoogleExchangeRequest): Promise<TokenResponse> {
  return apiClient
    .post<TokenResponse>('/customers/auth/google/exchange', payload)
    .then((r) => r.data);
}

export function refreshAccessToken(refresh_token: string): Promise<TokenResponse> {
  return apiClient
    .post<TokenResponse>('/customers/refresh', { refresh_token })
    .then((r) => r.data);
}

// ── §2 Home ───────────────────────────────────────────────────────────────────

export function getCategories(): Promise<StoreCategory[]> {
  return apiClient.get<StoreCategory[]>('/store-categories').then((r) => r.data);
}

export function getHomeOffers(): Promise<HomePageOffer[]> {
  return apiClient.get<HomePageOffer[]>('/offers?active_only=true').then((r) => r.data);
}

export function getNearbyStores(params?: {
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  limit?: number;
}): Promise<PaginatedResponse<NearbyStore>> {
  return apiClient
    .get<PaginatedResponse<NearbyStore>>('/stores/search/nearby', { params })
    .then((r) => r.data);
}

// ── §3 Explore ────────────────────────────────────────────────────────────────

export function getExploreStores(params?: {
  category?: string;
  latitude?: number;
  longitude?: number;
  page?: number;
}): Promise<PaginatedResponse<NearbyStore>> {
  return apiClient
    .get<PaginatedResponse<NearbyStore>>('/stores', { params })
    .then((r) => r.data);
}

// ── §4 Search ─────────────────────────────────────────────────────────────────

export function searchStores(params: {
  q: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  page?: number;
}): Promise<SearchResponse> {
  return apiClient.get<SearchResponse>('/search', { params }).then((r) => r.data);
}

// ── §5 Venue Detail ───────────────────────────────────────────────────────────

export function getStoreDetail(storeId: number): Promise<StoreDetail> {
  return apiClient.get<StoreDetail>(`/stores/${storeId}`).then((r) => r.data);
}

export function getStoreTeam(storeId: number): Promise<StoreTeamMember[]> {
  return apiClient.get<StoreTeamMember[]>(`/stores/${storeId}/team`).then((r) => r.data);
}

export function getStoreServices(storeId: number): Promise<Service[]> {
  return apiClient.get<Service[]>(`/stores/${storeId}/services`).then((r) => r.data);
}

export function getStoreReviews(
  storeId: number,
  params?: { page?: number },
): Promise<PaginatedResponse<Review>> {
  return apiClient
    .get<PaginatedResponse<Review>>(`/stores/${storeId}/reviews`, { params })
    .then((r) => r.data);
}

export function addFavourite(storeId: number): Promise<FavouriteRead> {
  return apiClient
    .post<FavouriteRead>('/favourites', { store_id: storeId })
    .then((r) => r.data);
}

export function removeFavourite(storeId: number): Promise<void> {
  return apiClient.delete(`/favourites/${storeId}`).then(() => undefined);
}

// ── §6 Booking ────────────────────────────────────────────────────────────────

export function getAvailability(
  storeId: number,
  params: { date: string; service_ids: number[] },
): Promise<AvailabilityResponse> {
  return apiClient
    .get<AvailabilityResponse>(`/stores/${storeId}/availability`, {
      params: { date: params.date, service_ids: params.service_ids.join(',') },
    })
    .then((r) => r.data);
}

export function createBooking(payload: CreateBookingRequest): Promise<BookingRead> {
  return apiClient.post<BookingRead>('/bookings', payload).then((r) => r.data);
}

// ── §7 Confirmation / Rebook ──────────────────────────────────────────────────

export function getBooking(bookingId: number): Promise<BookingRead> {
  return apiClient.get<BookingRead>(`/bookings/${bookingId}`).then((r) => r.data);
}

export function rebookBooking(bookingId: number): Promise<BookingRead> {
  return apiClient.post<BookingRead>(`/bookings/${bookingId}/rebook`).then((r) => r.data);
}

// ── §8 Activity ───────────────────────────────────────────────────────────────

export function getBookings(params?: {
  status?: string;
  page?: number;
}): Promise<PaginatedResponse<BookingRead>> {
  return apiClient
    .get<PaginatedResponse<BookingRead>>('/bookings/my-bookings', { params })
    .then((r) => r.data);
}

// ── §9 Activity Detail ────────────────────────────────────────────────────────

export function cancelBooking(bookingId: number, reason?: string): Promise<BookingRead> {
  return apiClient
    .post<BookingRead>(`/bookings/${bookingId}/cancel`, { reason })
    .then((r) => r.data);
}

export function submitReview(
  bookingId: number,
  payload: { rating: number; body: string },
): Promise<Review> {
  return apiClient
    .post<Review>(`/bookings/${bookingId}/review`, payload)
    .then((r) => r.data);
}

// ── §10 Order Chat ────────────────────────────────────────────────────────────

export function getChatMessages(bookingId: number): Promise<BookingMessage[]> {
  return apiClient
    .get<BookingMessage[]>(`/bookings/${bookingId}/messages`)
    .then((r) => r.data);
}

export function sendChatMessage(
  bookingId: number,
  payload: SendMessageRequest,
): Promise<BookingMessage> {
  return apiClient
    .post<BookingMessage>(`/bookings/${bookingId}/messages`, payload)
    .then((r) => r.data);
}

export function getUnreadMessageCount(bookingId: number): Promise<MessageUnreadCountResponse> {
  return apiClient
    .get<MessageUnreadCountResponse>(`/bookings/${bookingId}/messages/unread-count`)
    .then((r) => r.data);
}

export function markMessagesRead(bookingId: number): Promise<MarkReadResponse> {
  return apiClient
    .post<MarkReadResponse>(`/bookings/${bookingId}/messages/mark-read`)
    .then((r) => r.data);
}

// ── §11 Profile ───────────────────────────────────────────────────────────────

export function getMyProfile(): Promise<CustomerProfile> {
  return apiClient.get<CustomerProfile>('/customers/me').then((r) => r.data);
}

export function updateMyProfile(
  payload: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'preferred_language'>>,
): Promise<CustomerProfile> {
  return apiClient.patch<CustomerProfile>('/customers/me', payload).then((r) => r.data);
}

export function getFavourites(params?: { page?: number }): Promise<PaginatedResponse<FavouriteRead>> {
  return apiClient
    .get<PaginatedResponse<FavouriteRead>>('/favourites', { params })
    .then((r) => r.data);
}

export function getMyReviews(params?: { page?: number }): Promise<PaginatedResponse<Review>> {
  return apiClient
    .get<PaginatedResponse<Review>>('/customers/me/reviews', { params })
    .then((r) => r.data);
}

// ── §12 Notifications ─────────────────────────────────────────────────────────

export function getNotifications(params?: {
  page?: number;
}): Promise<PaginatedResponse<NotificationRead>> {
  return apiClient
    .get<PaginatedResponse<NotificationRead>>('/notifications', { params })
    .then((r) => r.data);
}

export function markNotificationRead(notificationId: number): Promise<NotificationRead> {
  return apiClient
    .post<NotificationRead>(`/notifications/${notificationId}/mark-read`)
    .then((r) => r.data);
}

export function markAllNotificationsRead(): Promise<{ marked_read: number }> {
  return apiClient
    .post<{ marked_read: number }>('/notifications/mark-all-read')
    .then((r) => r.data);
}
