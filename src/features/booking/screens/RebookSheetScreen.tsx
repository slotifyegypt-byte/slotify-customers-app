import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { colors, radius, spacing } from '@/theme';

import type { BookingRead } from '../api/schemas';
import { BookingFlow } from '../components/BookingFlow';
import { useBookingDetail } from '../hooks/useBookingDetail';
import { useStoreServices } from '../hooks/useStoreServices';

// Minimal header (back button only) for loading/error states, which have no
// title/subtitle to show yet — replaces the native header's back affordance
// now that this route renders `headerShown: false` (BookingFlow itself owns
// the real header once a service is resolved).
function BackOnlyHeader() {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Ionicons name="chevron-back" size={18} color={colors.brand} />
      </Pressable>
    </View>
  );
}

// customer-app-api-map.md §7: rebook is a normal POST /bookings with the same
// service(s) and a new time from GET /availability — no dedicated endpoint.
// Only the first service on the original booking is rebooked (the common
// case, and the only shape the doc's samples show); a banner below warns the
// customer if the original booking had more than one.
export function RebookSheetScreen() {
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const original = useBookingDetail(bookingId);

  const handleBooked = (booking: BookingRead) => {
    router.replace({ pathname: '/(modal)/confirmation', params: { bookingId: booking.id } });
  };

  if (original.isLoading) {
    return (
      <Screen style={styles.container}>
        <BackOnlyHeader />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brand} />
        </View>
      </Screen>
    );
  }

  if (original.isError || !original.data) {
    return (
      <Screen style={styles.container}>
        <BackOnlyHeader />
        <View style={styles.centered}>
          <EmptyState
            title={t('common.errorGeneric')}
            actionLabel={t('common.retry')}
            onAction={() => original.refetch()}
          />
        </View>
      </Screen>
    );
  }

  return <RebookFlow originalBooking={original.data} onBooked={handleBooked} />;
}

function RebookFlow({ originalBooking, onBooked }: { originalBooking: BookingRead; onBooked: (booking: BookingRead) => void }) {
  const { t } = useTranslation();
  // Guard: only mount useStoreServices once we have a real storeId, avoiding
  // a wasted request with an empty id while `original` above is loading.
  const services = useStoreServices(originalBooking.store_id);
  const firstService = originalBooking.booking_services[0];

  const matchedService = useMemo(
    () => services.data?.find((service) => service.id === firstService?.service_id),
    [services.data, firstService],
  );

  if (services.isLoading) {
    return (
      <Screen style={styles.container}>
        <BackOnlyHeader />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brand} />
        </View>
      </Screen>
    );
  }

  if (services.isError || !firstService || !matchedService) {
    return (
      <Screen style={styles.container}>
        <BackOnlyHeader />
        <View style={styles.centered}>
          <EmptyState
            title={t('common.errorGeneric')}
            actionLabel={t('common.retry')}
            onAction={() => services.refetch()}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      {originalBooking.booking_services.length > 1 ? (
        <ThemedText variant="caption" color="warning" style={styles.notice}>
          {/* TODO i18n */}
          This booking had multiple services — only {matchedService.name} will be rebooked.
        </ThemedText>
      ) : null}
      <BookingFlow
        key={matchedService.id}
        storeId={originalBooking.store_id}
        service={matchedService}
        storeName={originalBooking.store_name}
        initialEmployeeId={firstService.employee_id}
        onBooked={onBooked}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notice: { padding: spacing.md, paddingBottom: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
