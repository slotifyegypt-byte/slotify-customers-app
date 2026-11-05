import { Stack } from 'expo-router';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function HomeStackLayout() {
  return (
    <ErrorBoundary boundary="Home tab">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        {/* Design's Search screen is chromeless — a custom search row + "Cancel"
            link, no native title bar (see SearchScreen.tsx). */}
        <Stack.Screen name="search" options={{ headerShown: false }} />
        {/* The category screen draws its own back button and large title (CategoryListingScreen). */}
        <Stack.Screen name="category/[categoryKey]" options={{ headerShown: false }} />
      </Stack>
    </ErrorBoundary>
  );
}
