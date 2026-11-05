import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Photo } from '@/components/Photo';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import { useBookingDetail, useCancelBooking } from '@/features/booking/hooks/useBookingDetail';
import { isApiError } from '@/lib/api/errors';
import { formatHour } from '@/lib/time/branchTime';
import { radius, shadows, spacing, useColors } from '@/theme';

import { isOrderBooking } from '../utils/bookingDisplay';
import { dayLabel } from '../utils/dateLabels';

// developer-guide.md §5 "Cancel": `transition_booking` with an optional `reason`. There is no reason field: the
// sheet says what will happen, in calm words, and offers the safe choice first.
//
// The always-on "free cancellation up to 2 hours before" notice lives on the booking page; this sheet's fee
// warning only appears once the customer is actually inside that window. `FREE_CANCEL_WINDOW_MS` mirrors the same
// 2-hour policy.
const FREE_CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000;

// Plain (non-hook) helper so the `Date.now()` read lives outside the component body, as `formatCountdown` does.
function withinCancelFeeWindow(bookingDateIso: string): boolean {
  return new Date(bookingDateIso).getTime() - Date.now() < FREE_CANCEL_WINDOW_MS;
}

// A bottom sheet over a dimmed screen, presented as a transparent modal route (see app/(modal)/_layout.tsx).
export function CancelBookingScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = useBookingDetail(bookingId);
  const cancelBooking = useCancelBooking(bookingId);

  // `booking_type` is server-computed: 'drop_off' is an order, anything else an appointment.
  const isOrder = booking.data ? isOrderBooking(booking.data) : false;
  const isWithinFeeWindow = booking.data ? withinCancelFeeWindow(booking.data.booking_date) : false;

  const dismiss = () => router.back();

  const handleConfirm = async () => {
    try {
      await cancelBooking.mutateAsync(undefined);
      router.back();
    } catch (error) {
      if (isApiError(error, 'invalid_transition')) {
        // The booking moved on (already cancelled, completed or marked no-show) since this screen loaded: say so
        // and close; the hook has already refetched, so the detail screen behind shows the real status.
        Alert.alert(t('activity.cancel.notPossibleTitle'), t('activity.cancel.notPossibleBody'), [
          { text: t('common.ok'), onPress: dismiss },
        ]);
        return;
      }
      Alert.alert(t('common.errorGeneric'));
    }
  };

  const data = booking.data;
  const when = data
    ? `${dayLabel(data.booking_date, data.timezone, i18n.language, {
        today: t('activity.relative.today'),
        tomorrow: t('activity.relative.tomorrow'),
        yesterday: t('activity.relative.yesterday'),
      })} · ${formatHour(data.booking_date, data.timezone)}`
    : '';
  const feeNote = isOrder
    ? t('activity.cancel.feeNoteOrder')
    : t('activity.cancel.feeNoteAppointment');

  return (
    <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={dismiss}>
      {/* Swallow taps on the sheet itself so they don't bubble to the overlay's dismiss-on-press-outside. */}
      <Animated.View
        entering={SlideInDown.duration(320).reduceMotion(ReduceMotion.System)}
        style={[shadows.lg, styles.sheetShadow]}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm,
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />

          <ThemedText variant="h2">
            {isOrder ? t('activity.cancel.titleOrder') : t('activity.cancel.titleAppointment')}
          </ThemedText>

          <View style={[styles.summary, { backgroundColor: colors.backgroundMuted }]}>
            {data ? (
              <>
                <Photo
                  uri={data.store_logo}
                  name={data.store_name}
                  style={styles.photo}
                  initialSize={18}
                />
                <View style={styles.summaryText}>
                  <ThemedText variant="bodyMedium" numberOfLines={1}>
                    {data.store_name}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
                    {data.booking_services_str}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
                    {when}
                  </ThemedText>
                </View>
              </>
            ) : (
              <>
                <Skeleton width={44} height={44} radius={radius.sm + 2} />
                <View style={styles.summaryText}>
                  <Skeleton width="60%" height={15} />
                  <Skeleton width="45%" height={13} />
                </View>
              </>
            )}
          </View>

          <View style={styles.notes}>
            <Note
              icon={isWithinFeeWindow ? 'alert-circle-outline' : 'checkmark-circle-outline'}
              tone={isWithinFeeWindow ? 'warning' : 'success'}
              text={isWithinFeeWindow ? feeNote : t('activity.cancel.freeNote')}
            />
            <Note
              icon="information-circle-outline"
              tone="neutral"
              text={t('activity.cancel.permanent')}
            />
          </View>

          {/* The safe choice is the filled, first button; cancelling is the quieter, outlined one below it,
              so an accidental tap never cancels the booking. */}
          <View style={styles.buttons}>
            <Button
              label={
                isOrder ? t('activity.cancel.keepOrder') : t('activity.cancel.keepAppointment')
              }
              onPress={dismiss}
            />
            <Button
              label={
                isOrder
                  ? t('activity.cancel.confirmOrder')
                  : t('activity.cancel.confirmAppointment')
              }
              variant="ghost"
              tone="danger"
              loading={cancelBooking.isPending}
              onPress={handleConfirm}
            />
          </View>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

function Note({
  icon,
  tone,
  text,
}: {
  icon: 'alert-circle-outline' | 'checkmark-circle-outline' | 'information-circle-outline';
  tone: 'warning' | 'success' | 'neutral';
  text: string;
}) {
  const colors = useColors();
  const glyph =
    tone === 'warning' ? colors.warning : tone === 'success' ? colors.success : colors.textTertiary;
  return (
    <View style={styles.note}>
      <Ionicons name={icon} size={20} color={glyph} />
      <ThemedText variant="body" color="textSecondary" style={styles.noteText}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheetShadow: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: spacing.xs },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
  },
  photo: { width: 44, height: 44, borderRadius: radius.sm + 2 },
  summaryText: { flex: 1, minWidth: 0, gap: 2 },
  notes: { gap: spacing.sm },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  noteText: { flex: 1 },
  buttons: { gap: spacing.sm, marginTop: spacing.xs },
});
