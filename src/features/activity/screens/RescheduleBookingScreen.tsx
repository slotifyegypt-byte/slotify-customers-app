import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import type { AvailabilityParams } from '@/features/booking/api/bookingApi';
import type { AvailabilitySlot } from '@/features/booking/api/schemas';
import { DateStrip } from '@/features/booking/components/DateStrip';
import { SlotGrid } from '@/features/booking/components/SlotGrid';
import { useAvailability } from '@/features/booking/hooks/useAvailability';
import { useBookingDetail, useRescheduleBooking } from '@/features/booking/hooks/useBookingDetail';
import { getBookingErrorMessage, isCapacityConflict } from '@/features/booking/utils/apiError';
import { toBookingTimestamp } from '@/features/booking/utils/time';
import { colors, radius, spacing } from '@/theme';

/**
 * New endpoint — VERIFIED against live /openapi.json + response shapes
 * (2026-09-20): PUT /bookings/services/{booking_service_id}/reschedule/my-booking.
 * Time-only: the specialist already on this booking_service stays put, so
 * this reuses the same DateStrip -> SlotGrid pattern BookingFlow uses for a
 * fresh booking, but skips SpecialistPicker entirely and pins the
 * availability lookup to that specialist's employee_id.
 *
 * Reached from BookingDetailScreen's "Reschedule" button, which only shows
 * for specialist-mode (appointment) bookings and passes the specific
 * booking_service's own integer id (not the parent booking's UUID).
 */
export function RescheduleBookingScreen() {
  const { t } = useTranslation();
  const { bookingId, bookingServiceId } = useLocalSearchParams<{ bookingId: string; bookingServiceId: string }>();
  const booking = useBookingDetail(bookingId);
  const reschedule = useRescheduleBooking(bookingId);

  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const bookingService = booking.data?.booking_services.find((s) => String(s.id) === bookingServiceId);

  const availabilityParams: AvailabilityParams | null = useMemo(() => {
    if (!booking.data || !bookingService) return null;
    return {
      store_id: booking.data.store_id,
      service_id: bookingService.service_id,
      date: selectedDate,
      ...(bookingService.employee_id ? { employee_id: bookingService.employee_id } : {}),
    };
  }, [booking.data, bookingService, selectedDate]);

  const availability = useAvailability(availabilityParams);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setFormError(null);
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !bookingService) return;
    setFormError(null);
    try {
      await reschedule.mutateAsync({
        bookingServiceId: bookingService.id,
        booking_start_time: toBookingTimestamp(selectedSlot.start_time),
        booking_end_time: toBookingTimestamp(selectedSlot.end_time),
      });
      router.back();
    } catch (error) {
      // Same 409/422 shape as create-booking (§6 samples) — a 409 here means
      // the newly-picked slot filled up between fetch and confirm.
      setFormError(getBookingErrorMessage(error, t('common.errorGeneric')));
      if (isCapacityConflict(error)) {
        setSelectedSlot(null);
        availability.refetch();
      }
    }
  };

  if (booking.isLoading) {
    return (
      <Screen style={styles.container}>
        <ScreenHeader title={/* TODO i18n */ 'Reschedule'} />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brand} />
        </View>
      </Screen>
    );
  }

  if (booking.isError || !booking.data || !bookingService) {
    return (
      <Screen style={styles.container}>
        <ScreenHeader title={/* TODO i18n */ 'Reschedule'} />
        <View style={styles.centered}>
          <EmptyState
            title={t('common.errorGeneric')}
            actionLabel={t('common.retry')}
            onAction={() => booking.refetch()}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <ScreenHeader title={/* TODO i18n */ 'Reschedule'} subtitle={bookingService.service_name ?? undefined} />
      <View style={styles.content}>
        <ThemedText variant="bodyMedium" style={styles.label}>
          {/* TODO i18n */}
          Date & Time
        </ThemedText>
        <DateStrip selectedDate={selectedDate} onSelectDate={handleSelectDate} />
        <View style={styles.slotGridWrap}>
          <SlotGrid
            availability={availability.data}
            isLoading={availability.isLoading}
            isError={availability.isError}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </View>
        {formError ? (
          <View style={styles.errorBanner}>
            <ThemedText variant="caption" color="danger">
              {formError}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          label={/* TODO i18n */ 'Confirm New Time'}
          variant="accent"
          onPress={handleConfirm}
          loading={reschedule.isPending}
          disabled={!selectedSlot}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: spacing.md },
  label: { marginBottom: spacing.xs },
  slotGridWrap: { marginTop: spacing.sm },
  errorBanner: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
