import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ListRow } from '@/components/ListRow';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import type { BookingRead } from '@/features/booking/api/schemas';
import { useBookingDetail } from '@/features/booking/hooks/useBookingDetail';
import { useStoreDetail } from '@/features/explore-search/hooks/useStoreDetail';
import { formatDate } from '@/lib/time/branchTime';
import { enter, radius, spacing } from '@/theme';

import { BookingHero } from '../components/BookingHero';
import { ServicesCard, WhereWithCard } from '../components/BookingSummary';
import { OrderTracker } from '../components/OrderTracker';
import { useStoreTeam } from '../hooks/useStoreTeam';
import { isOrderBooking } from '../utils/bookingDisplay';

export function BookingDetailScreen() {
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = useBookingDetail(bookingId);

  // Only fetched when at least one service is specialist-mode, to resolve `employee_id` -> a display name (§9;
  // see venue/api/venueApi.ts getStoreTeam for why this lookup is needed instead of a field already on the booking).
  const hasSpecialistService = booking.data?.booking_services.some((s) => s.employee_id) ?? false;
  const team = useStoreTeam(
    hasSpecialistService && booking.data?.venue_available ? booking.data.store_id : undefined,
  );
  // Directions (real lat/lng) and Call (real phone) both need the full store record: BookingRead only carries
  // store_name/address/logo.
  const store = useStoreDetail(booking.data?.store_id ?? '', {
    enabled: Boolean(booking.data?.store_id) && booking.data?.venue_available === true,
  });

  if (booking.isLoading) {
    return (
      <Screen edges={['top']}>
        <ScreenHeader title="" />
        <DetailSkeleton />
      </Screen>
    );
  }

  if (booking.isError || !booking.data) {
    return (
      <Screen edges={['top']}>
        <ScreenHeader title="" />
        <View style={styles.flex}>
          <EmptyState
            icon="cloud-offline-outline"
            title={t('common.errorGeneric')}
            actionLabel={t('common.retry')}
            onAction={() => booking.refetch()}
          />
        </View>
      </Screen>
    );
  }

  const data = booking.data;
  // §0.1/§0.2: BookingRead returns a server-computed `booking_type`. "drop_off" = capacity mode (tailoring, car
  // wash/repair, detailing); "appointment" = specialist mode (barber/salon/spa).
  const isOrder = isOrderBooking(data);
  const isActive = data.booking_status === 'pending' || data.booking_status === 'confirmed';
  // One review per booking: once reviewed, the button goes away.
  const canReview = data.booking_status === 'completed' && !data.has_review && data.venue_available;

  const employeeName = (employeeId: string) => {
    const member = team.data?.find((m) => m.id === employeeId);
    if (member) return [member.first_name, member.last_name].filter(Boolean).join(' ');
    // Team lookup missing/failed: fall back to the name snapshotted on the booking.
    return data.booking_services.find((s) => s.employee_id === employeeId)?.employee_name ?? null;
  };
  const specialists = [
    ...new Set(
      data.booking_services
        .map((s) => (s.employee_id ? employeeName(s.employee_id) : null))
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  const handleDirections = () => {
    if (!store.data) return;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${store.data.latitude},${store.data.longitude}`,
    );
  };

  // PUT /bookings/services/{booking_service_id}/reschedule/my-booking: time-only (same assigned specialist), so
  // this only ever targets the specialist-mode service on the booking.
  const specialistServiceForReschedule = data.booking_services.find((s) => s.employee_id);
  const handleReschedule = () => {
    if (!specialistServiceForReschedule) return;
    router.push({
      pathname: '/(modal)/reschedule-booking',
      params: { bookingId: data.id, bookingServiceId: String(specialistServiceForReschedule.id) },
    });
  };

  const handleWriteReview = () =>
    router.push({
      pathname: '/(modal)/write-review',
      params: {
        storeId: data.store_id,
        // `canReview` already gates this handler behind `booking_status === 'completed'`, which is exactly the
        // eligibility the backend enforces for `ReviewCreate.booking_id`, so `data.id` is always valid here.
        bookingId: data.id,
        serviceName: data.booking_services.map((s) => s.service_name).join(', '),
        date: formatDate(data.booking_date, data.timezone),
      },
    });

  const handleCancel = () => router.push(`/(modal)/cancel-booking?bookingId=${data.id}`);
  const handleMessage = () => router.push(`/chat/${data.id}`);
  const handleCall = () => {
    if (!store.data?.phone) return;
    Linking.openURL(`tel:${store.data.phone}`);
  };
  const handleViewPlace = () => router.push(`/venue/${data.store_id}`);

  const canDirections = Boolean(store.data);
  const canReschedule =
    isActive && !isOrder && Boolean(specialistServiceForReschedule) && data.venue_available;
  const canMessage = isActive && data.venue_available;
  const hasPhone = Boolean(store.data?.phone);

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title={isOrder ? t('activity.detail.titleOrder') : t('activity.detail.titleAppointment')}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={enter(0)}>
          <BookingHero booking={data} />
        </Animated.View>

        {isOrder ? (
          <Animated.View entering={enter(1)}>
            <OrderTracker status={data.booking_status} />
          </Animated.View>
        ) : null}

        <Animated.View entering={enter(2)}>
          <WhereWithCard booking={data} specialists={isOrder ? [] : specialists} />
        </Animated.View>

        <Animated.View entering={enter(3)}>
          <ServicesCard booking={data} />
        </Animated.View>

        {!data.venue_available ? (
          <Animated.View entering={enter(4)}>
            <Card>
              <ThemedText variant="body" color="textSecondary">
                {t('activity.detail.venueUnavailable')}
              </ThemedText>
            </Card>
          </Animated.View>
        ) : null}

        <Animated.View entering={enter(4)} style={styles.actions}>
          {isActive ? (
            <>
              <Button
                label={t('activity.detail.directions')}
                icon="navigate-outline"
                onPress={handleDirections}
                disabled={!canDirections}
              />
              {isOrder ? (
                <View style={styles.pair}>
                  <Button
                    label={t('activity.detail.message')}
                    icon="chatbubble-outline"
                    variant="secondary"
                    onPress={handleMessage}
                    disabled={!canMessage}
                    style={styles.half}
                  />
                  <Button
                    label={t('activity.detail.call')}
                    icon="call-outline"
                    variant="secondary"
                    onPress={handleCall}
                    disabled={!hasPhone}
                    style={styles.half}
                  />
                </View>
              ) : (
                <View style={styles.pair}>
                  {canReschedule ? (
                    <Button
                      label={t('activity.detail.reschedule')}
                      icon="calendar-outline"
                      variant="secondary"
                      onPress={handleReschedule}
                      style={styles.half}
                    />
                  ) : null}
                  <Button
                    label={t('activity.detail.message')}
                    icon="chatbubble-outline"
                    variant="secondary"
                    onPress={handleMessage}
                    disabled={!canMessage}
                    style={styles.half}
                  />
                </View>
              )}
              {!isOrder ? (
                <>
                  <ThemedText variant="caption" color="textTertiary" style={styles.note}>
                    {t('activity.detail.freeCancel')}
                  </ThemedText>
                  <PressableScale
                    onPress={handleCancel}
                    accessibilityRole="button"
                    accessibilityLabel={t('activity.detail.cancelAppointment')}
                    scaleTo={0.97}
                    style={styles.cancel}
                  >
                    <ThemedText variant="bodyMedium" color="danger">
                      {t('activity.detail.cancelAppointment')}
                    </ThemedText>
                  </PressableScale>
                </>
              ) : null}
            </>
          ) : (
            <CompletedActions
              data={data}
              canReview={canReview}
              canDirections={canDirections}
              onWriteReview={handleWriteReview}
              onDirections={handleDirections}
              onViewPlace={handleViewPlace}
            />
          )}
        </Animated.View>

        {data.has_review ? (
          <Animated.View entering={enter(5)}>
            <Card padding="none">
              <ListRow
                icon="star"
                title={t('activity.detail.reviewed')}
                onPress={() => router.push('/(tabs)/profile/my-reviews')}
              />
            </Card>
          </Animated.View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

// Once a booking is over the actions are about the next step: review it, find it again, or go back to the place.
function CompletedActions({
  data,
  canReview,
  canDirections,
  onWriteReview,
  onDirections,
  onViewPlace,
}: {
  data: BookingRead;
  canReview: boolean;
  canDirections: boolean;
  onWriteReview: () => void;
  onDirections: () => void;
  onViewPlace: () => void;
}) {
  const { t } = useTranslation();
  const canViewPlace = data.venue_available;
  return (
    <>
      {canReview ? (
        <Button
          label={t('activity.detail.writeReview')}
          icon="star-outline"
          onPress={onWriteReview}
        />
      ) : null}
      {canViewPlace ? (
        <Button
          label={t('activity.detail.viewPlace')}
          icon="storefront-outline"
          variant={canReview ? 'secondary' : 'primary'}
          onPress={onViewPlace}
        />
      ) : null}
      {canViewPlace && data.booking_status === 'completed' ? (
        <Button
          label={t('activity.detail.directions')}
          icon="navigate-outline"
          variant="ghost"
          onPress={onDirections}
          disabled={!canDirections}
        />
      ) : null}
    </>
  );
}

// The page's final layout in grey: the hero, the two cards and the action stack.
function DetailSkeleton() {
  return (
    <View style={styles.content}>
      <Skeleton height={236} radius={radius.xl} />
      <Skeleton height={132} radius={radius.lg} />
      <Skeleton height={150} radius={radius.lg} />
      <View style={styles.actions}>
        <Skeleton height={52} radius={radius.pill} />
        <Skeleton height={52} radius={radius.pill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: 120,
    gap: spacing.md,
  },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
  pair: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  note: { textAlign: 'center', marginTop: spacing.xs },
  cancel: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});
