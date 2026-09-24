import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { useBookingDetail, useCancelBooking } from '@/features/booking/hooks/useBookingDetail';
import { colors, radius, spacing } from '@/theme';

// customer-app-api-map.md §9 — POST /bookings/{booking_id}/cancel, body
// `{ reason }` is optional, but 30-cancel-modal.png shows no reason field at
// all — just a title, one line of contextual body copy, and the two
// buttons. Matching that literally: no text input here.
//
// 30-cancel-modal.png shows two distinct pieces of copy that must stay
// separate: the always-on "free cancellation up to 2 hours before" notice
// (rendered on the booking detail screen itself, not here — see
// BookingDetailScreen's `freeCancelNote`) and this dialog's fee-*warning*,
// which only appears once the customer is actually inside that window.
// `FREE_CANCEL_WINDOW_MS` mirrors the same 2-hour policy referenced there.
const FREE_CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000;

// Plain (non-hook) helper so the `Date.now()` read lives outside the
// component/hook body — matches how `formatCountdown` keeps its own
// `Date.now()` call out of HomeScreen's render function.
function withinCancelFeeWindow(bookingDateIso: string): boolean {
  return new Date(bookingDateIso).getTime() - Date.now() < FREE_CANCEL_WINDOW_MS;
}

// Centered dimmed-overlay dialog — matches 30-cancel-modal.png exactly
// (title + one line of body copy + two buttons, nothing else), presented as
// a transparent modal route (see app/(modal)/_layout.tsx) rather than a
// full-screen sheet with a native header.
export function CancelBookingScreen() {
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = useBookingDetail(bookingId);
  const cancelBooking = useCancelBooking(bookingId);

  // `booking_type` — VERIFIED against live /openapi.json + response shapes
  // (2026-09-20): replaces the old every-service-has-no-employee_id
  // inference (see BookingDetailScreen/ActivityScreen for the same swap).
  const isOrder = booking.data?.booking_type === 'drop_off';
  const noun = isOrder ? 'order' : 'appointment'; // TODO i18n
  const isWithinFeeWindow = booking.data ? withinCancelFeeWindow(booking.data.booking_date) : false;

  const dismiss = () => router.back();

  const handleConfirm = async () => {
    try {
      await cancelBooking.mutateAsync(undefined);
      router.back();
    } catch {
      Alert.alert(t('common.errorGeneric')); // TODO i18n
    }
  };

  return (
    <Pressable style={styles.overlay} onPress={dismiss}>
      {/* Swallow taps on the card itself so they don't bubble to the
          overlay's dismiss-on-press-outside behavior. */}
      <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
        <ThemedText variant="h2" style={styles.title}>
          {/* TODO i18n */}
          {`Cancel this ${noun}?`}
        </ThemedText>
        <ThemedText variant="body" color="textSecondary" style={styles.body}>
          {/* TODO i18n */}
          {isWithinFeeWindow
            ? `You're within 2 hours of your ${noun} — a cancellation fee may apply.`
            : "This can't be undone."}
        </ThemedText>

        {/* Safe action (Keep) is the visually primary, first button; the
            destructive action (Cancel) is a secondary, outlined button
            below it — protects against an accidental tap cancelling the
            booking, matching 30-cancel-modal.png's button hierarchy. */}
        <Button
          label={/* TODO i18n */ `Keep ${isOrder ? 'Order' : 'Appointment'}`}
          variant="accent"
          onPress={dismiss}
          style={styles.primaryButton}
        />
        <Button
          label={/* TODO i18n */ `Cancel ${isOrder ? 'Order' : 'Appointment'}`}
          variant="ghost"
          tone="danger"
          loading={cancelBooking.isPending}
          style={styles.secondaryButton}
          onPress={handleConfirm}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', marginTop: spacing.xs },
  primaryButton: { marginTop: spacing.lg },
  secondaryButton: { marginTop: spacing.sm },
});
