import { Stack } from 'expo-router';

import { ErrorBoundary } from '@/components/ErrorBoundary';

// Anchor the stack on the list. Home's "next up" card and push notifications deep-link straight to
// `/(tabs)/activity/<id>`; without an anchor the tab's stack is created holding only the detail screen, so Back has
// nothing to pop and re-tapping the Activity tab keeps showing that same booking.
export const unstable_settings = { initialRouteName: 'index' };

export default function ActivityStackLayout() {
  return (
    <ErrorBoundary boundary="Activity tab">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        {/* BookingDetailScreen renders its own ScreenHeader (back button +
            "Appointment"/"Your Order" title) — no native header here. */}
        <Stack.Screen name="[bookingId]" />
      </Stack>
    </ErrorBoundary>
  );
}
