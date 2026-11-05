import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ThemedText } from '@/components/ThemedText';
import type { BookingRead } from '@/features/booking/api/schemas';
import { useMyBookings } from '@/features/booking/hooks/useMyBookings';
import { enter, spacing } from '@/theme';

import { BookingCard, BookingCardSkeleton } from '../components/BookingCard';
import { groupActiveBookings, groupPastBookings } from '../utils/bookingDisplay';
import { monthHeading } from '../utils/dateLabels';

// customer-app-api-map.md §8: Active = confirmed + pending, merged client-side (there is no combined-status
// query param); Past = completed + cancelled + no_show. A local segmented control stands in for a nested
// navigator since the two lists share no state worth preserving.
type Tab = 'active' | 'past';

type Row =
  | { type: 'heading'; key: string; title: string }
  | { type: 'booking'; key: string; booking: BookingRead };

export function ActivityScreen() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>('active');

  const confirmed = useMyBookings('confirmed');
  const pending = useMyBookings('pending');
  const completed = useMyBookings('completed');
  const cancelled = useMyBookings('cancelled');
  const noShow = useMyBookings('no_show');

  const activeBookings = useMemo(
    () => [...(confirmed.data ?? []), ...(pending.data ?? [])],
    [confirmed.data, pending.data],
  );
  const pastBookings = useMemo(
    () => [...(completed.data ?? []), ...(cancelled.data ?? []), ...(noShow.data ?? [])],
    [completed.data, cancelled.data, noShow.data],
  );

  const isActive = tab === 'active';
  const isLoading = isActive
    ? confirmed.isLoading || pending.isLoading
    : completed.isLoading || cancelled.isLoading || noShow.isLoading;
  const isError = isActive
    ? confirmed.isError || pending.isError
    : completed.isError || cancelled.isError || noShow.isError;
  const refetch = () => {
    if (isActive) {
      confirmed.refetch();
      pending.refetch();
    } else {
      completed.refetch();
      cancelled.refetch();
      noShow.refetch();
    }
  };

  // One flat list of headings and cards, so the list stays virtualised.
  const rows = useMemo<Row[]>(() => {
    if (isActive) {
      return groupActiveBookings(activeBookings).flatMap((group) => [
        {
          type: 'heading' as const,
          key: `h-${group.key}`,
          title: t(`activity.group.${group.key}`),
        },
        ...group.bookings.map((booking) => ({
          type: 'booking' as const,
          key: booking.id,
          booking,
        })),
      ]);
    }
    return groupPastBookings(pastBookings).flatMap((group) => [
      {
        type: 'heading' as const,
        key: `h-${group.month}`,
        title: monthHeading(group.sample.booking_date, group.sample.timezone, i18n.language),
      },
      ...group.bookings.map((booking) => ({ type: 'booking' as const, key: booking.id, booking })),
    ]);
  }, [isActive, activeBookings, pastBookings, t, i18n.language]);

  const openBooking = (booking: BookingRead) => router.push(`/(tabs)/activity/${booking.id}`);

  return (
    <Screen edges={['top']}>
      <Animated.View entering={enter(0)} style={styles.header}>
        <ThemedText variant="h1">{t('activity.title')}</ThemedText>
      </Animated.View>

      <Animated.View entering={enter(1)} style={styles.segment}>
        <SegmentedControl
          options={[
            { key: 'active', label: t('activity.tabActive') },
            { key: 'past', label: t('activity.tabPast') },
          ]}
          value={tab}
          onChange={setTab}
        />
      </Animated.View>

      {isLoading ? (
        <View style={styles.list}>
          {[0, 1, 2, 3].map((i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.flex}>
          <EmptyState
            icon="cloud-offline-outline"
            title={t('common.errorGeneric')}
            actionLabel={t('common.retry')}
            onAction={refetch}
          />
        </View>
      ) : !rows.length ? (
        <View style={styles.flex}>
          <EmptyState
            icon="calendar-outline"
            title={isActive ? t('activity.empty.activeTitle') : t('activity.empty.pastTitle')}
            body={isActive ? t('activity.empty.activeBody') : t('activity.empty.pastBody')}
            actionLabel={isActive ? t('activity.empty.activeAction') : undefined}
            onAction={isActive ? () => router.push('/(tabs)/explore') : undefined}
          />
        </View>
      ) : (
        <FlatList<Row>
          data={rows}
          keyExtractor={(row) => row.key}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) =>
            item.type === 'heading' ? (
              <ThemedText
                variant="h3"
                accessibilityRole="header"
                style={index === 0 ? styles.firstHeading : styles.heading}
              >
                {item.title}
              </ThemedText>
            ) : (
              <Animated.View entering={enter(Math.min(index, 6))}>
                <BookingCard booking={item.booking} onPress={() => openBooking(item.booking)} />
              </Animated.View>
            )
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  segment: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.gutter, paddingBottom: 120, gap: spacing.sm },
  heading: { marginTop: spacing.md },
  firstHeading: { marginTop: 4 },
});
