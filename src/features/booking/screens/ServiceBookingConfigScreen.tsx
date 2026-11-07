import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { useStoreDetail } from '@/features/explore-search/hooks/useStoreDetail';
import { formatMoney } from '@/lib/money';
import { enter, spacing, useColors } from '@/theme';

import type { Service } from '../api/schemas';
import { BookingFlow } from '../components/BookingFlow';
import { BookingSkeleton } from '../components/BookingSkeleton';
import { useStoreServices } from '../hooks/useStoreServices';
import { useDraftEntries } from '../state/bookingDraftStore';

// customer-app-api-map.md §6: "Service Booking Configuration & Booking Sheet
// Overlay": pick a service (if not already chosen from the venue's services
// tab), then specialist (specialist-mode only) -> date -> time -> confirm.
export function ServiceBookingConfigScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const { storeId, serviceId: serviceIdParam } = useLocalSearchParams<{
    storeId: string;
    serviceId?: string;
  }>();
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

  const handleBooked = (booking: { id: string }) => {
    router.push({ pathname: '/(modal)/confirmation', params: { bookingId: booking.id } });
  };

  // The branch timezone (store detail) decides "today" and the date strip,
  // so the booking flow waits for it as well as for the services.
  if (services.isLoading || store.isLoading) {
    return (
      <Screen style={styles.container}>
        <BookingSkeleton shape={serviceIdParam ? 'flow' : 'list'} />
      </Screen>
    );
  }

  if (services.isError || store.isError || !store.data) {
    return (
      <Screen style={styles.container}>
        <ScreenHeader title="" />
        <EmptyState
          icon="cloud-offline-outline"
          title={t('common.errorGeneric')}
          actionLabel={t('common.retry')}
          onAction={() => {
            if (services.isError) services.refetch();
            if (store.isError || !store.data) store.refetch();
          }}
        />
      </Screen>
    );
  }

  if (!selectedServiceId || !selectedService) {
    return (
      <Screen style={styles.container}>
        <ScreenHeader title={t('booking.chooseService')} subtitle={store.data.name} />
        <FlatList
          data={services.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={enter(index)}>
              <Card onPress={() => setPickedServiceId(item.id)} accessibilityLabel={item.name}>
                <View style={styles.serviceRow}>
                  <View style={styles.serviceInfo}>
                    <ThemedText variant="h3">{item.name}</ThemedText>
                    <View style={styles.meta}>
                      <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                      <ThemedText variant="caption" color="textSecondary">
                        {t('booking.minutes', { count: item.duration_minutes })}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText variant="h3">{formatMoney(item.price, item.currency)}</ThemedText>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </View>
              </Card>
            </Animated.View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="cut-outline"
              title={t('booking.noServices')}
              body={t('booking.noServicesBody')}
              actionLabel={t('booking.goBack')}
              onAction={() => router.back()}
            />
          }
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
        storeName={store.data.name}
        timezone={store.data.timezone}
        initialEmployeeId={draftEntry?.employeeId ?? null}
        initialDate={draftEntry?.date}
        initialSlot={draftEntry?.slot ?? null}
        onBooked={handleBooked}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  serviceInfo: { flex: 1, minWidth: 0, gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
