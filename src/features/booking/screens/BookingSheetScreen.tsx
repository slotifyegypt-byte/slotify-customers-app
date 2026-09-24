// customer-app-api-map.md §6 treats "Service Booking Configuration" and
// "Booking Sheet Overlay" as one combined flow, and this app already has two
// separate routes pointed at it: `/booking/[storeId]/configure` (a full-page
// push, used when no service is pre-selected yet — starts at service
// selection) and `/(modal)/booking-sheet` (a modal presentation, for
// contexts that already know the storeId/serviceId — e.g. a "Book" button on
// a specific service row on the venue detail screen — and just want the
// slot-picking sheet without a full navigation push). Both need identical
// service -> specialist -> date -> slot -> confirm logic, so this is a thin
// alias rather than a second implementation to keep in sync.
export { ServiceBookingConfigScreen as BookingSheetScreen } from './ServiceBookingConfigScreen';
