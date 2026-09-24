import { Stack } from 'expo-router';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ExploreStackLayout() {
  return (
    <ErrorBoundary boundary="Explore tab">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ErrorBoundary>
  );
}
