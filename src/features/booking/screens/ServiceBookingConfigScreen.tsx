import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { useStoreDetail } from '@/features/explore-search/hooks/useStoreDetail';
import { colors, radius, spacing } from '@/theme';

import type { BookingRead, Service } from '../api/schemas';
import { BookingFlow } from '../components/BookingFlow';
import { useStoreServices } from '../hooks/useStoreServices';
import { useDraftEntries } from '../state/bookingDraftStore';

// customer-app-api-map.md §6: "Service Booking Configuration & Booking Sheet
// Overlay" — pick a service (if not already chosen from the venue's services
// tab), then specialist (specialist-mode only) -> date -> time -> confirm.
export function ServiceBookingConfigScreen() {
  const { t } = useTranslation();
  const { storeId, serviceId: serviceIdParam } = useLocalSearchParams<{ storeId: string; serviceId?: string }>();
  const [pickedServiceId, setPickedServiceId] = useState<string | null>(null);

  const services = useStoreServices(storeId);
  const store = useStoreDetail(storeId);
  const selectedServiceId = pickedServiceId ?? serviceIdParam ?? null;

  const selectedService: Service | undefined = useMemo(
    () => services.data?.find((service) => service.id === selectedServiceId),
    [services.data, selectedServiceId],
  );

  // Re-opening a service already configured in this visit's draft (tapped
  // again from the store page's services list) pre-fills its saved
  // specialist/date/time instead of starting over.
  const draftEntries = useDraftEntries(storeId);
  const draftEntry = selectedService ? draftEntries[selectedService.id] : undefined;

  const handleBooked = (booking: BookingRead) => {
    router.push({ pathname: '/(modal)/confirmation', params: { bookingId: booking.id } });
  };

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

  if (services.isError) {
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

  if (!selectedServiceId || !selectedService) {
    return (
      <Screen style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <Ionicons name="chevron-back" size={18} color={colors.brand} />
          </Pressable>
          <View style={styles.headerText}>
            <ThemedText variant="h2" numberOfLines={1}>
              {/* TODO i18n */}
              Choose a service
            </ThemedText>
            {store.data?.name ? (
              <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
                {store.data.name}
              </ThemedText>
            ) : null}
          </View>
        </View>
        <FlatList
          data={services.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.serviceRow} onPress={() => setPickedServiceId(item.id)}>
              <View style={styles.serviceInfo}>
                <ThemedText variant="bodyMedium">{item.name}</ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  {item.duration_minutes} min
                </ThemedText>
              </View>
              <ThemedText variant="bodyMedium">
                {item.price_symbol}
                {item.price}
              </ThemedText>
            </Pressable>
          )}
          ListEmptyComponent={<EmptyState title="No services available" />} /* TODO i18n */
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <BookingFlow
        key={selectedService.id}
        storeId={storeId}
        service={selectedService}
        storeName={store.data?.name}
        initialEmployeeId={draftEntry?.employeeId ?? null}
        initialDate={draftEntry?.date}
        initialSlot={draftEntry?.slot ?? null}
        onBooked={handleBooked}
      />
    </Screen>
  );
}

// Minimal header (back button only) for the loading/error states, which
// have no title/subtitle to show yet — still needs to replace the native
// header's back affordance now that this route renders `headerShown: false`.
function BackOnlyHeader() {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Ionicons name="chevron-back" size={18} color={colors.brand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  headerText: { flex: 1, minWidth: 0 },
  list: { padding: spacing.md, paddingTop: 0 },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  serviceInfo: { flex: 1 },
});
