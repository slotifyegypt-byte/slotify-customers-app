import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Divider } from '@/components/Divider';
import { EmptyState } from '@/components/EmptyState';
import { Photo } from '@/components/Photo';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import { useStoreTeam } from '@/features/activity/hooks/useStoreTeam';
import { formatMoney } from '@/lib/money';
import { formatDate, formatDateTitle, formatHour } from '@/lib/time/branchTime';
import { enter, radius, shadows, spacing, useColors } from '@/theme';

import { DrawnCheck } from '../components/DrawnCheck';
import { useBookingDetail } from '../hooks/useBookingDetail';

// Converts an ISO timestamp (booking_start_time/end_time are UTC) into the
// YYYYMMDDTHHMMSSZ shape Google Calendar's "render" template URL expects.
function toGoogleCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// developer-guide.md §6: `POST bookings` only hands back the new id; the
// summary is the BookingRead re-fetched here via `getBooking(bookingId)`
// rather than serialized through navigation params.
//
// A small celebration on the deep-indigo hero surface (a tick that draws
// itself), then one clean card with everything the customer needs: where,
// when, what, with whom and the total. Next actions sit in a bar at the bottom.
export function ConfirmationScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = useBookingDetail(bookingId);

  // Each item carries a snapshot of the specialist's name taken at booking
  // time; the store's team list is only a fallback for a missing snapshot.
  // Only fetched when at least one service actually has a specialist.
  const hasSpecialistService = booking.data?.booking_services.some((s) => s.employee_id) ?? false;
  const team = useStoreTeam(hasSpecialistService ? booking.data?.store_id : undefined);

  const handleBackHome = () => {
    router.dismissAll();
    router.replace('/(tabs)/home');
  };

  // There's no expo-calendar dependency in this app yet, so rather than pull
  // in a new native module for one button, this opens a pre-filled Google
  // Calendar "create event" page: a real, working affordance without a new
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
      Alert.alert(t('booking.calendarError'));
    }
  };

  if (booking.isLoading) {
    return (
      <Screen style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={248} radius={radius.xl} />
          <Skeleton height={300} radius={radius.lg} />
        </View>
      </Screen>
    );
  }

  if (booking.isError || !booking.data) {
    return (
      <Screen style={styles.centered}>
        <EmptyState
          icon="cloud-offline-outline"
          title={t('common.errorGeneric')}
          actionLabel={t('common.retry')}
          onAction={() => booking.refetch()}
        />
      </Screen>
    );
  }

  const data = booking.data;
  const isPending = data.booking_status === 'pending';

  const employeeName = (employeeId: string) => {
    const member = team.data?.find((m) => m.id === employeeId);
    if (!member) return null;
    return [member.first_name, member.last_name].filter(Boolean).join(' ');
  };

  // BookingRead carries the address but no coordinates, so directions search by address.
  const handleOpenMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${data.store_name}, ${data.store_address}`,
      )}`,
    );
  };

  return (
    <Screen style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          entering={enter(0)}
          style={[styles.hero, shadows.md, { backgroundColor: colors.hero }]}
        >
          <View
            pointerEvents="none"
            style={[styles.ring, styles.ringBig, { borderColor: colors.onHeroTint }]}
          />
          <View
            pointerEvents="none"
            style={[styles.ring, styles.ringSmall, { borderColor: colors.onHeroTint }]}
          />
          <DrawnCheck />
          <View style={styles.heroText}>
            <ThemedText variant="h1" color="onHero" style={styles.center}>
              {isPending ? t('booking.requestSent') : t('booking.confirmed')}
            </ThemedText>
            <ThemedText variant="bodyLarge" color="onHeroMuted" style={styles.center}>
              {isPending ? t('booking.requestSentBody') : t('booking.confirmedBody')}
            </ThemedText>
          </View>
          <View style={[styles.when, { backgroundColor: colors.onHeroTint }]}>
            <Ionicons name="calendar-outline" size={16} color={colors.onHero} />
            <ThemedText variant="bodyMedium" color="onHero">
              {formatDateTitle(data.booking_date, data.timezone)} ·{' '}
              {formatHour(data.booking_date, data.timezone)}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <Card padding="none">
            <View style={styles.venue}>
              <Photo
                uri={data.store_logo}
                name={data.store_name}
                style={styles.venuePhoto}
                initialSize={20}
              />
              <View style={styles.flex}>
                <ThemedText variant="h3" numberOfLines={1}>
                  {data.store_name}
                </ThemedText>
                {data.store_address ? (
                  <ThemedText variant="caption" color="textSecondary" numberOfLines={2}>
                    {data.store_address}
                  </ThemedText>
                ) : null}
              </View>
            </View>
            <Divider />

            <View style={styles.block}>
              {data.booking_services.map((service) => {
                const specialist = service.employee_id
                  ? (service.employee_name ?? employeeName(service.employee_id))
                  : null;
                return (
                  <View key={service.id} style={styles.serviceRow}>
                    <View style={styles.flex}>
                      <ThemedText variant="bodyMedium">{service.service_name}</ThemedText>
                      {/* Capacity-mode services have employee_id === null and skip the person (§0.2). */}
                      <ThemedText variant="caption" color="textSecondary">
                        {formatHour(service.booking_start_time, data.timezone)}
                        {service.employee_id
                          ? ` · ${specialist ?? t('booking.anyProfessional')}`
                          : ''}
                      </ThemedText>
                    </View>
                    <ThemedText variant="bodyMedium">
                      {formatMoney(service.total_price, data.currency)}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
            <Divider />

            <Fact
              icon="calendar-outline"
              title={formatDate(data.booking_date, data.timezone)}
              subtitle={formatHour(data.booking_date, data.timezone)}
            />
            <Divider />
            <Fact
              icon="location-outline"
              title={data.store_address}
              subtitle={t('booking.getDirections')}
              onPress={handleOpenMaps}
            />
            <Divider />

            <View style={[styles.total, { backgroundColor: colors.backgroundMuted }]}>
              <ThemedText variant="bodyMedium" color="textSecondary">
                {t('booking.total')}
              </ThemedText>
              <ThemedText variant="h2">{formatMoney(data.total_price, data.currency)}</ThemedText>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={enter(2)}
        style={[
          styles.bar,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
          shadows.md,
        ]}
      >
        <Button
          label={t('booking.addToCalendar')}
          icon="calendar-outline"
          onPress={() => handleAddToCalendar(data)}
        />
        <Button label={t('booking.backHome')} variant="ghost" onPress={handleBackHome} />
      </Animated.View>
    </Screen>
  );
}

function Fact({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  const body = (
    <View style={styles.fact}>
      <View style={[styles.factIcon, { backgroundColor: colors.brandTint }]}>
        <Ionicons name={icon} size={18} color={colors.brandAccent} />
      </View>
      <View style={styles.flex}>
        <ThemedText variant="bodyMedium">{title}</ThemedText>
        {subtitle ? (
          <ThemedText variant="caption" color={onPress ? 'brandAccent' : 'textSecondary'}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${subtitle ?? ''} ${title}`.trim()}
      scaleTo={0.99}
    >
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  hero: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    overflow: 'hidden',
  },
  ring: { position: 'absolute', borderWidth: 1.5, borderRadius: 999 },
  ringBig: { width: 260, height: 260, end: -90, top: -100 },
  ringSmall: { width: 150, height: 150, end: -40, top: -40 },
  heroText: { gap: spacing.xs, alignItems: 'center' },
  center: { textAlign: 'center' },
  when: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  venue: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  venuePhoto: { width: 48, height: 48, borderRadius: radius.md },
  block: { padding: spacing.md, gap: spacing.sm },
  serviceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  fact: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  factIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  bar: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
});
