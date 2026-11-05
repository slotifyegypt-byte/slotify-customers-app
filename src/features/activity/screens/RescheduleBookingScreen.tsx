import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import type { AvailabilityParams } from '@/features/booking/api/bookingApi';
import { bookingKeys } from '@/features/booking/api/queryKeys';
import type { AvailabilitySlot } from '@/features/booking/api/schemas';
import { DateStrip } from '@/features/booking/components/DateStrip';
import { SlotGrid } from '@/features/booking/components/SlotGrid';
import { useAvailability } from '@/features/booking/hooks/useAvailability';
import { useBookingDetail, useRescheduleBooking } from '@/features/booking/hooks/useBookingDetail';
import { useSingleFlight } from '@/features/booking/hooks/useSingleFlight';
import {
  getBookingErrorMessage,
  isSlotConflict,
  slotConflictMessage,
} from '@/features/booking/utils/bookingErrors';
import { isApiError } from '@/lib/api/errors';
import { branchToday, formatHour } from '@/lib/time/branchTime';
import { enter, radius, spacing, useColors } from '@/theme';

import { dayLabel } from '../utils/dateLabels';
import { rescheduleAvailabilityParams } from '../utils/rescheduleParams';

/**
 * developer-guide.md §6 "Reschedule": `PATCH bookings/items/{item_id}` with
 * `{ starts_at }`. Customers can only move the TIME of an item on their own
 * booking — the specialist already on it stays put — so this reuses the
 * DateStrip -> SlotGrid pattern BookingFlow uses, skips SpecialistPicker and
 * pins the availability lookup to that specialist. Swapping specialists is a
 * rebook (RebookSheetScreen), not a reschedule.
 *
 * Reached from BookingDetailScreen's "Reschedule" button, which only shows
 * for specialist-mode (appointment) bookings and passes the booking item's
 * uuid as `bookingServiceId`. Dates are the BRANCH's (booking `timezone`).
 */
export function RescheduleBookingScreen() {
  const colors = useColors();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { bookingId, bookingServiceId } = useLocalSearchParams<{
    bookingId: string;
    bookingServiceId: string;
  }>();
  const booking = useBookingDetail(bookingId);
  const reschedule = useRescheduleBooking();
  // A second tap before the button disables must not send a second PATCH.
  const runOnce = useSingleFlight();

  // null until the customer picks a day: defaults to the branch's today,
  // which needs the booking (its timezone) to have loaded.
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const timezone = booking.data?.timezone;
  const selectedDate = pickedDate ?? (timezone ? branchToday(timezone) : null);
  const bookingService = booking.data?.booking_services.find((s) => s.id === bookingServiceId);

  const availabilityParams: AvailabilityParams | null = useMemo(() => {
    if (!booking.data || !bookingService || !selectedDate) return null;
    return rescheduleAvailabilityParams(booking.data, bookingService, selectedDate);
  }, [booking.data, bookingService, selectedDate]);

  const availability = useAvailability(availabilityParams);

  const handleSelectDate = (date: string) => {
    setPickedDate(date);
    setSelectedSlot(null);
    setFormError(null);
  };

  const handleConfirm = () =>
    runOnce(async () => {
      if (!selectedSlot || !bookingService) return;
      setFormError(null);
      try {
        // The slot's UTC instant goes up as-is; the server derives the end.
        await reschedule.mutateAsync({
          itemId: bookingService.id,
          starts_at: selectedSlot.start_time,
        });
        router.back();
      } catch (error) {
        // slot_taken / slot_unavailable: someone got there first; time_in_past:
        // the slot expired while the screen was open. Either way re-read the
        // grid and ask for another time.
        if (isSlotConflict(error) || isApiError(error, 'time_in_past')) {
          setSelectedSlot(null);
          setFormError(slotConflictMessage(error, []));
          if (availabilityParams) {
            queryClient.invalidateQueries({
              queryKey: bookingKeys.availability(availabilityParams),
            });
          }
          return;
        }
        setFormError(getBookingErrorMessage(error, t('common.errorGeneric')));
      }
    });

  const relative = {
    today: t('activity.relative.today'),
    tomorrow: t('activity.relative.tomorrow'),
    yesterday: t('activity.relative.yesterday'),
  };

  if (booking.isLoading) {
    return (
      <Screen edges={['top']}>
        <ScreenHeader title={t('activity.reschedule.title')} />
        <View style={styles.content}>
          <Skeleton height={72} radius={radius.lg} />
          <Skeleton width="40%" height={20} />
          <View style={styles.row}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={52} height={64} radius={radius.md} />
            ))}
          </View>
          <View style={styles.grid}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width="31%" height={42} radius={radius.md} />
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  if (booking.isError || !booking.data || !bookingService || !selectedDate) {
    return (
      <Screen edges={['top']}>
        <ScreenHeader title={t('activity.reschedule.title')} />
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

  const current = `${dayLabel(booking.data.booking_date, booking.data.timezone, i18n.language, relative)} · ${formatHour(
    booking.data.booking_date,
    booking.data.timezone,
  )}`;

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader
          title={t('activity.reschedule.title')}
          subtitle={bookingService.service_name ?? undefined}
        />
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={enter(0)} style={styles.block}>
            <Card>
              <View style={styles.currentRow}>
                <View style={[styles.well, { backgroundColor: colors.brandTint }]}>
                  <Ionicons name="calendar-outline" size={18} color={colors.brandAccent} />
                </View>
                <View style={styles.flex}>
                  <ThemedText variant="caption" color="textTertiary">
                    {t('activity.reschedule.current')}
                  </ThemedText>
                  <ThemedText variant="bodyMedium">{current}</ThemedText>
                </View>
              </View>
            </Card>
            <ThemedText variant="caption" color="textSecondary">
              {t('activity.reschedule.reassure')}
            </ThemedText>
          </Animated.View>

          <Animated.View entering={enter(1)} style={styles.block}>
            <ThemedText variant="h3" accessibilityRole="header">
              {t('activity.reschedule.pickTime')}
            </ThemedText>
            <DateStrip
              selectedDate={selectedDate}
              timezone={booking.data.timezone}
              onSelectDate={handleSelectDate}
            />
          </Animated.View>

          <Animated.View entering={enter(2)}>
            <SlotGrid
              availability={availability.data}
              isLoading={availability.isLoading}
              isError={availability.isError}
              error={availability.error}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          </Animated.View>

          {formError ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerTint }]}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
              <ThemedText variant="caption" color="danger" style={styles.flex}>
                {formError}
              </ThemedText>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          <ThemedText variant="caption" color="textSecondary" style={styles.summary}>
            {selectedSlot
              ? `${t('activity.reschedule.newTime')}: ${dayLabel(
                  selectedSlot.start_time,
                  booking.data.timezone,
                  i18n.language,
                  relative,
                )} · ${selectedSlot.time_slot_str}`
              : t('activity.reschedule.pickToContinue')}
          </ThemedText>
          <Button
            label={t('activity.reschedule.confirm')}
            onPress={handleConfirm}
            loading={reschedule.isPending}
            disabled={!selectedSlot}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  block: { gap: spacing.sm },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  well: {
    width: 36,
    height: 36,
    borderRadius: radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  summary: { textAlign: 'center' },
});
