import { useQueryClient } from '@tanstack/react-query';
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
import { bookingKeys } from '@/features/booking/api/queryKeys';
import type { AvailabilitySlot } from '@/features/booking/api/schemas';
import { DateStrip } from '@/features/booking/components/DateStrip';
import { SlotGrid } from '@/features/booking/components/SlotGrid';
import { useAvailability } from '@/features/booking/hooks/useAvailability';
import { useBookingDetail, useRescheduleBooking } from '@/features/booking/hooks/useBookingDetail';
import { getBookingErrorMessage, isSlotConflict, slotConflictMessage } from '@/features/booking/utils/bookingErrors';
import { isApiError } from '@/lib/api/errors';
import { branchToday } from '@/lib/time/branchTime';
import { radius, spacing, useColors, type Colors } from '@/theme';

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
  const styles = createStyles(colors);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { bookingId, bookingServiceId } = useLocalSearchParams<{ bookingId: string; bookingServiceId: string }>();
  const booking = useBookingDetail(bookingId);
  const reschedule = useRescheduleBooking();

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
    return {
      store_id: booking.data.store_id,
      service_id: bookingService.service_id,
      date: selectedDate,
      ...(bookingService.employee_id ? { employee_id: bookingService.employee_id } : {}),
    };
  }, [booking.data, bookingService, selectedDate]);

  const availability = useAvailability(availabilityParams);

  const handleSelectDate = (date: string) => {
    setPickedDate(date);
    setSelectedSlot(null);
    setFormError(null);
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !bookingService) return;
    setFormError(null);
    try {
      // The slot's UTC instant goes up as-is; the server derives the end.
      await reschedule.mutateAsync({ itemId: bookingService.id, starts_at: selectedSlot.start_time });
      router.back();
    } catch (error) {
      // slot_taken / slot_unavailable: someone got there first; time_in_past:
      // the slot expired while the screen was open. Either way re-read the
      // grid and ask for another time.
      if (isSlotConflict(error) || isApiError(error, 'time_in_past')) {
        setSelectedSlot(null);
        setFormError(slotConflictMessage(error, []));
        if (availabilityParams) {
          queryClient.invalidateQueries({ queryKey: bookingKeys.availability(availabilityParams) });
        }
        return;
      }
      setFormError(getBookingErrorMessage(error, t('common.errorGeneric')));
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

  if (booking.isError || !booking.data || !bookingService || !selectedDate) {
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
        <DateStrip selectedDate={selectedDate} timezone={booking.data.timezone} onSelectDate={handleSelectDate} />
        <View style={styles.slotGridWrap}>
          <SlotGrid
            availability={availability.data}
            isLoading={availability.isLoading}
            isError={availability.isError}
            error={availability.error}
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

const createStyles = (colors: Colors) =>
  StyleSheet.create({
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
