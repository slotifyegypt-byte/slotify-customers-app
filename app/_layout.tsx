import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuthStore } from '@/features/auth/store/authStore';
import '@/lib/i18n';
import { queryClient } from '@/lib/query/queryClient';
import { initSentry } from '@/lib/sentry';
import { useThemePreferenceStore } from '@/lib/theme/themePreferenceStore';
import { fontsToLoad, ThemeProvider, useTheme } from '@/theme';

// Flips the status bar icon color with the resolved theme — needs to read
// useTheme() from inside <ThemeProvider>, so it's a child component rather
// than inlined in RootLayout (which renders ThemeProvider itself).
function AppStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
}

SplashScreen.preventAutoHideAsync();
initSentry();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontsToLoad);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const themeHasHydrated = useThemePreferenceStore((s) => s._hasHydrated);

  const ready = fontsLoaded && hasHydrated && themeHasHydrated;

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Deliberately NOT `if (!ready) return null` here — that would unmount the
  // whole navigator tree while waiting, and expo-router's linking resolver
  // needs the Stack mounted immediately to correctly process the initial
  // URL (returning null caused it to lose track of "/" entirely, landing on
  // not-found). The native splash screen (still up until `ready`) covers
  // any pre-hydration flash instead.
  const isAuthed = Boolean(accessToken);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppStatusBar />
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary boundary="root">
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth/callback" />
              <Stack.Protected guard={isAuthed}>
                <Stack.Screen name="(tabs)" />
                {/* headerShown: false — the venue screen renders its own
                    overlaid back/share/favourite buttons on top of the photo
                    carousel (see VenueHeader), so a native header bar would
                    just push the photo down and duplicate the back control. */}
                <Stack.Screen name="venue/[storeId]" options={{ headerShown: false }} />
                <Stack.Screen name="booking/[storeId]/configure" options={{ headerShown: false }} />
                {/* OrderChatScreen renders its own header (back button, provider
                    avatar, title/subtitle) to match the chat design — no native
                    stack header here. */}
                <Stack.Screen name="chat/[bookingId]" options={{ headerShown: false }} />
                {/* NotificationsScreen renders its own header (back button,
                    title, "Mark all as read") to match 07-notifications.png —
                    no native stack header here. */}
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
                <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
              </Stack.Protected>
              <Stack.Protected guard={!isAuthed}>
                <Stack.Screen name="sign-in" />
              </Stack.Protected>
            </Stack>
          </ErrorBoundary>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
