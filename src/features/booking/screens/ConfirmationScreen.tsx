import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { useStoreTeam } from '@/features/activity/hooks/useStoreTeam';
import { radius, spacing, useColors, type Colors } from '@/theme';

import { useBookingDetail } from '../hooks/useBookingDetail';
import { formatBookingDateTitle, formatBookingHourStr } from '../utils/time';

// Converts an offset-qualified ISO timestamp (see utils/time.ts —
// booking_start_time/end_time always carry Cairo's +02:00) into the
// YYYYMMDDTHHMMSSZ shape Google Calendar's "render" template URL expects.
function toGoogleCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// customer-app-api-map.md §7: confirmation summary is just the BookingRead
// returned by POST /bookings — re-fetched here via bookingId rather than
// serialized through navigation params, per the task brief.
//
// Design ref 27-booking-confirmation.png: green check + title/subtitle, a
// summary card (venue label, service, specialist, date/time), a dark
// "Total" bar, a small map preview with a time callout, then a dark "Add to
// calendar" button with a plain "Back to home" link underneath (not another
// button).
export function ConfirmationScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = useBookingDetail(bookingId);

  // Same pattern as BookingDetailScreen: employee_id on a booking service is
  // just an id, so resolving it to a display name needs the store's team
  // list. Only fetched when at least one service actually has a specialist.
  const hasSpecialistService = booking.data?.booking_services.some((s) => s.employee_id) ?? false;
  const team = useStoreTeam(hasSpecialistService ? booking.data?.store_id : undefined);

  const handleBackHome = () => {
    router.dismissAll();
    router.replace('/(tabs)/home');
  };

  // There's no expo-calendar dependency in this app yet, so rather than pull
  // in a new native module for one button, this opens a pre-filled Google
  // Calendar "create event" page — a real, working affordance without a new
  // native dependency. Swap for a native calendar write if/when expo-calendar
  // is added.
  const handleAddToCalendar = async (data: NonNullable<typeof booking.data>) => {
    const first = data.booking_services[0];
    if (!first) return;
    try {
      const start = toGoogleCalendarStamp(first.booking_start_time);
      const end = toGoogleCalendarStamp(first.booking_end_time);
      const title = encodeURIComponent(data.booking_services_str || first.service_name);
      const location = encodeURIComponent(`${data.store_name}, ${data.store_address}`);
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}`;
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('common.errorGeneric')); // TODO i18n: dedicated calendar-open failure copy
    }
  };

  if (booking.isLoading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.brand} />
      </Screen>
    );
  }

  if (booking.isError || !booking.data) {
    return (
      <Screen style={styles.centered}>
        <EmptyState
          title={t('common.errorGeneric')}
          actionLabel={t('common.retry')}
          onAction={() => booking.refetch()}
        />
      </Screen>
    );
  }

  const data = booking.data;

  const employeeName = (employeeId: string) => {
    const member = team.data?.find((m) => m.id === employeeId);
    if (!member) return null;
    return [member.first_name, member.last_name].filter(Boolean).join(' ');
  };

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={30} color={colors.success} />
        </View>
        <ThemedText variant="h1" style={styles.center}>
          {/* TODO i18n */}
          Booking confirmed
        </ThemedText>
        <ThemedText variant="body" color="textSecondary" style={[styles.center, styles.subtitle]}>
          {/* TODO i18n */}
          {data.booking_status === 'pending'
            ? "We'll notify you once the store confirms."
            : "You'll get a reminder 1 hour before"}
        </ThemedText>

        <View style={styles.card}>
          <ThemedText variant="caption" color="textSecondary" style={styles.storeLabel}>
            {data.store_name.toUpperCase()}
          </ThemedText>

          {data.booking_services.map((service, index) => (
            <View key={service.id} style={index > 0 ? styles.serviceBlockBorder : undefined}>
              <ThemedText variant="bodyMedium" style={styles.serviceName}>
                {service.service_name}
              </ThemedText>
              {/* Capacity-mode services have employee_id === null and skip this
                  row entirely (§0.2) — no specialist to name. */}
              {service.employee_id ? (
                <View style={styles.metaRow}>
                  <Ionicons name="star" size={14} color={colors.ratingStar} />
                  <ThemedText variant="caption" color="textSecondary">
                    {/* TODO i18n */}
                    {employeeName(service.employee_id) ?? 'Any professional'}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          ))}

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <ThemedText variant="caption" color="textSecondary">
              {formatBookingDateTitle(data.booking_date)} · {formatBookingHourStr(data.booking_date)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.totalBar}>
          <ThemedText variant="bodyMedium" color="textInverse">
            {/* TODO i18n */}
            Total
          </ThemedText>
          <ThemedText variant="h3" color="textInverse">
            {/* TODO i18n: currency hardcoded — BookingRead has no price_symbol field */}
            {data.total_price} EGP
          </ThemedText>
        </View>

        {/* BookingRead carries no store lat/lng, so this is a static, non-
            interactive preview rather than a real map — the pin + time
            callout are still real booking data (formatBookingHourStr). */}
        <View style={styles.mapPreview}>
          <Ionicons name="map-outline" size={28} color={colors.textSecondary} style={styles.mapFallbackIcon} />
          <View style={styles.pinColumn} pointerEvents="none">
            <View style={styles.timeCallout}>
              <ThemedText variant="caption" color="textInverse">
                {formatBookingHourStr(data.booking_date)}
              </ThemedText>
            </View>
            <Ionicons name="caret-down" size={12} color={colors.brand} style={styles.calloutArrow} />
            <Ionicons name="location" size={22} color={colors.brandAccent} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={/* TODO i18n */ 'Add to calendar'}
          variant="secondary"
          onPress={() => handleAddToCalendar(data)}
        />
        <Pressable accessibilityRole="button" onPress={handleBackHome} style={styles.backHomeLink}>
          <ThemedText variant="bodyMedium" color="brandAccent">
            {/* TODO i18n */}
            Back to home
          </ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md, paddingBottom: spacing.xl, alignItems: 'stretch' },
  checkCircle: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center' },
  subtitle: { marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  storeLabel: { letterSpacing: 1, marginBottom: spacing.xs },
  serviceBlockBorder: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  serviceName: { marginBottom: spacing.xxs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, marginTop: spacing.xxs },
  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  mapPreview: {
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapFallbackIcon: { position: 'absolute' },
  pinColumn: { alignItems: 'center' },
  timeCallout: {
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  calloutArrow: { marginTop: -2 },
  footer: {
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  backHomeLink: { paddingVertical: spacing.xs },
});
