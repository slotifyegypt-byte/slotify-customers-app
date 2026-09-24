import { Stack } from 'expo-router';

import { ErrorBoundary } from '@/components/ErrorBoundary';

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
