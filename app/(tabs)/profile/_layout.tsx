import { Stack } from 'expo-router';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ProfileStackLayout() {
  return (
    <ErrorBoundary boundary="Profile tab">
      {/* Every sub-screen now renders its own `ScreenHeader` (back button +
          brand-purple title), matching 13-19-you-*.png exactly — the native
          header would just duplicate that chrome. */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="edit" />
        <Stack.Screen name="favourites" />
        <Stack.Screen name="my-reviews" />
        <Stack.Screen name="notification-settings" />
        <Stack.Screen name="language" />
        <Stack.Screen name="help" />
        <Stack.Screen name="contact" />
      </Stack>
    </ErrorBoundary>
  );
}
