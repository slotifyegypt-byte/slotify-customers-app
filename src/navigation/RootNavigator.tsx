import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';
import type { RootStackParamList } from './types';
import MainTabNavigator from './MainTabNavigator';

// Screens
import SignInScreen from '@/screens/auth/SignInScreen';
import NotificationsScreen from '@/screens/notifications/NotificationsScreen';
import BookingSheetScreen from '@/screens/overlays/BookingSheetScreen';
import RebookSheetScreen from '@/screens/overlays/RebookSheetScreen';
import CancelBookingScreen from '@/screens/overlays/CancelBookingScreen';
import ConfirmationScreen from '@/screens/overlays/ConfirmationScreen';
import SignedOutScreen from '@/screens/overlays/SignedOutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  // Should not happen since App.tsx gates on _hasHydrated, but guard for safety
  if (!hasHydrated) {
    return (
      <View style={s.loader}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {accessToken ? (
        <>
          {/* ── Main authenticated shell ── */}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />

          {/* ── Pushed (full-screen, card slide) ── */}
          <Stack.Screen name="Notifications" component={NotificationsScreen} />

          {/* ── Modals (slide-up bottom sheet) ── */}
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="BookingSheet"  component={BookingSheetScreen} />
            <Stack.Screen name="RebookSheet"   component={RebookSheetScreen} />
            <Stack.Screen name="CancelBooking" component={CancelBookingScreen} />
          </Stack.Group>

          {/* ── Full-screen modals (takeover overlays) ── */}
          <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
            <Stack.Screen name="SignedOut"    component={SignedOutScreen} />
          </Stack.Group>
        </>
      ) : (
        /* ── Auth gate ── */
        <Stack.Screen name="SignIn" component={SignInScreen} />
      )}
    </Stack.Navigator>
  );
}

const s = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas },
});
