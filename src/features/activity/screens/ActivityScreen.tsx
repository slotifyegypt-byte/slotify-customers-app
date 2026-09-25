import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ThemedText } from '@/components/ThemedText';
import type { BookingRead } from '@/features/booking/api/schemas';
import { useMyBookings } from '@/features/booking/hooks/useMyBookings';
import { formatBookingDateStr, formatBookingDateTitle, formatBookingHourStr } from '@/features/booking/utils/time';
import { iconForCategory, pinColorForCategory } from '@/features/home/utils/categoryIcon';
import { fontFamily, radius, shadows, spacing, useColors, type ColorToken, type Colors } from '@/theme';

// customer-app-api-map.md §8 — Active = confirmed + pending, merged
// client-side (no combined-status query param exists); Past = completed +
// cancelled. A simple local-state segmented control stands in for a nested
// navigator since there's no independent state to preserve per tab.
type Tab = 'active' | 'past';

// Design ground truth (03-activity.png) shows a third, capacity-mode-only
// status ("IN QUEUE") beyond CONFIRMED/IN PROGRESS, driven by a live queue
// position. Per customer-app-api-map.md §0.3, Live Queue is explicitly
// dropped from scope ("do not build"), and there is no backend field for it
// anyway — bookings only ever come back as pending/confirmed here. So every
// non-confirmed active booking reads as "IN PROGRESS" (capacity/order-type
// bookings, e.g. tailoring drop-off) or "PENDING" (specialist bookings
// awaiting store confirmation) instead of a fabricated queue position.
//
// `booking_type` — VERIFIED against live /openapi.json + response shapes
// (2026-09-20): replaces the old every-service-has-no-employee_id inference.
function isCapacityBooking(booking: BookingRead): boolean {
  return booking.booking_type === 'drop_off';
}

function activeStatusMeta(booking: BookingRead): { label: string; color: Extract<ColorToken, 'success' | 'warning'> } {
  if (booking.booking_status === 'confirmed') {
    // TODO i18n
    return { label: 'CONFIRMED', color: 'success' };
  }
  // TODO i18n
  return isCapacityBooking(booking)
    ? { label: 'IN PROGRESS', color: 'warning' }
    : { label: 'PENDING', color: 'warning' };
}

function activeSubtitle(booking: BookingRead): string {
  const hourStr = formatBookingHourStr(booking.booking_date);
  if (isCapacityBooking(booking)) {
    const count = booking.booking_services.length;
    // TODO i18n
    return `${count} item${count === 1 ? '' : 's'} · since ${hourStr}`;
  }
  return `${formatBookingDateTitle(booking.booking_date)} · ${hourStr}`;
}

export function ActivityScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('active');

  const confirmed = useMyBookings('confirmed');
  const pending = useMyBookings('pending');
  const completed = useMyBookings('completed');
  const cancelled = useMyBookings('cancelled');

  const activeBookings = useMemo(() => {
    const merged = [...(confirmed.data ?? []), ...(pending.data ?? [])];
    return merged.sort((a, b) => a.booking_date.localeCompare(b.booking_date));
  }, [confirmed.data, pending.data]);

  const pastBookings = useMemo(() => {
    const merged = [...(completed.data ?? []), ...(cancelled.data ?? [])];
    return merged.sort((a, b) => b.booking_date.localeCompare(a.booking_date));
  }, [completed.data, cancelled.data]);

  const isActive = tab === 'active';
  const isLoading = isActive ? confirmed.isLoading || pending.isLoading : completed.isLoading || cancelled.isLoading;
  const isError = isActive ? confirmed.isError || pending.isError : completed.isError || cancelled.isError;
  const data = isActive ? activeBookings : pastBookings;
  const refetch = () => {
    if (isActive) {
      confirmed.refetch();
      pending.refetch();
    } else {
      completed.refetch();
      cancelled.refetch();
    }
  };

  return (
    <Screen edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <ThemedText variant="h1">
          {/* TODO i18n */}
          Activity
        </ThemedText>
      </View>

      <View style={styles.segmentRow}>
        <SegmentedControl
          options={[
            { key: 'active', label: /* TODO i18n */ 'Active' },
            { key: 'past', label: /* TODO i18n */ 'Past' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <EmptyState title={t('common.errorGeneric')} actionLabel={t('common.retry')} onAction={refetch} />
        </View>
      ) : !data.length ? (
        <View style={styles.center}>
          <EmptyState
            title={
              /* TODO i18n */
              isActive ? 'No upcoming bookings' : 'No past bookings yet'
            }
            body={
              /* TODO i18n */
              isActive ? 'Book a service to see it here.' : "Bookings you've completed or cancelled show up here."
            }
          />
        </View>
      ) : (
        <FlatList<BookingRead>
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (isActive ? <ActiveBookingCard booking={item} /> : <PastBookingRow booking={item} />)}
        />
      )}
    </Screen>
  );
}

// Active card: colored left accent bar + circular photo thumbnail with a
// small status-icon badge + ALL-CAPS colored status label, per
// 03-activity.png. Status color always comes from `colors.success` /
// `colors.warning`, never a hardcoded hex.
function ActiveBookingCard({ booking }: { booking: BookingRead }) {
  const colors = useColors();
  const styles = createStyles(colors);
  const meta = activeStatusMeta(booking);
  const badgeIcon = booking.booking_status === 'confirmed' ? 'checkmark' : 'time';

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/(tabs)/activity/${booking.id}`)}>
      <View style={[styles.accentBar, { backgroundColor: colors[meta.color] }]} />
      <View style={styles.cardBody}>
        <View style={styles.thumbWrap}>
          {booking.store_logo ? (
            <Image source={{ uri: booking.store_logo }} style={styles.thumb} contentFit="cover" />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]} />
          )}
          <View style={[styles.statusBadge, { backgroundColor: colors[meta.color] }]}>
            <Ionicons name={badgeIcon} size={10} color={colors.textOnBrand} />
          </View>
        </View>
        <View style={styles.cardInfo}>
          <ThemedText variant="caption" color={meta.color} style={styles.statusLabel} numberOfLines={1}>
            {meta.label}
          </ThemedText>
          <ThemedText variant="h3" numberOfLines={1}>
            {booking.store_name}
          </ThemedText>
          <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
            {activeSubtitle(booking)}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

// Past row: flat list style, no card/accent-bar chrome — a category-tinted
// icon avatar (reusing home's category-icon heuristic, since a booking
// carries no structured category field) instead of a photo, per
// 11-activity-past.png.
function PastBookingRow({ booking }: { booking: BookingRead }) {
  const colors = useColors();
  const styles = createStyles(colors);
  const icon = iconForCategory(booking.store_name);
  const tint = pinColorForCategory(booking.store_name, colors);

  return (
    <Pressable style={styles.pastRow} onPress={() => router.push(`/(tabs)/activity/${booking.id}`)}>
      <View style={[styles.pastIconWrap, { backgroundColor: `${tint}1F` }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <View style={styles.rowInfo}>
        <ThemedText variant="h3" numberOfLines={1}>
          {booking.store_name}
        </ThemedText>
        <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
          {booking.booking_services_str} · {formatBookingDateStr(booking.booking_date)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  screen: { padding: 0 },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  segmentRow: { marginHorizontal: spacing.md, marginBottom: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },

  // Active cards
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  accentBar: { width: 4 },
  cardBody: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: spacing.sm },
  thumbWrap: { width: 48, height: 48 },
  thumb: { width: 48, height: 48, borderRadius: 24 },
  thumbFallback: { backgroundColor: colors.backgroundMuted },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  cardInfo: { flex: 1, marginLeft: spacing.sm, marginRight: spacing.xs },
  statusLabel: { fontFamily: fontFamily.bodySemiBold, letterSpacing: 0.4, marginBottom: 1 },

  // Past rows
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  pastIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1, marginLeft: spacing.sm, marginRight: spacing.xs },
  });
