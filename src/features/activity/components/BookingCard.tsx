import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Photo } from '@/components/Photo';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import type { BookingRead } from '@/features/booking/api/schemas';
import { formatHour } from '@/lib/time/branchTime';
import { radius, spacing, useColors } from '@/theme';

import { dayLabel, daysFromToday } from '../utils/dateLabels';

import { BookingStatusPill } from './BookingStatusPill';

/** One booking in the Activity list: the venue, what was booked, and when, with its state at the end. */
export function BookingCard({ booking, onPress }: { booking: BookingRead; onPress: () => void }) {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const when = `${dayLabel(booking.booking_date, booking.timezone, i18n.language, {
    today: t('activity.relative.today'),
    tomorrow: t('activity.relative.tomorrow'),
    yesterday: t('activity.relative.yesterday'),
  })} · ${formatHour(booking.booking_date, booking.timezone)}`;
  // Mint is the "happening today" signal, and only for bookings still ahead of the customer.
  const live =
    (booking.booking_status === 'confirmed' || booking.booking_status === 'pending') &&
    daysFromToday(booking.booking_date, booking.timezone) === 0;
  const dim = booking.booking_status === 'cancelled' || booking.booking_status === 'no_show';

  return (
    <Card
      padding="none"
      onPress={onPress}
      accessibilityLabel={`${booking.store_name}, ${booking.booking_services_str}, ${when}`}
    >
      <View style={styles.top}>
        <Photo
          uri={booking.store_logo}
          name={booking.store_name}
          style={[styles.photo, dim ? styles.dim : null]}
          initialSize={22}
        />
        <View style={styles.body}>
          <ThemedText variant="h3" numberOfLines={2}>
            {booking.store_name}
          </ThemedText>
          <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
            {booking.booking_services_str}
          </ThemedText>
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <View style={styles.when}>
          <Ionicons
            name={live ? 'time' : 'calendar-outline'}
            size={15}
            color={live ? colors.mintInk : colors.textSecondary}
          />
          <ThemedText variant="bodyMedium" color={live ? 'mintInk' : 'textPrimary'}>
            {when}
          </ThemedText>
        </View>
        <BookingStatusPill booking={booking} />
      </View>
    </Card>
  );
}

/** The card's shape while bookings load. */
export function BookingCardSkeleton() {
  const colors = useColors();
  return (
    <View
      style={[styles.skeleton, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.top}>
        <Skeleton width={56} height={56} radius={radius.md} />
        <View style={styles.body}>
          <Skeleton width="65%" height={17} />
          <Skeleton width="40%" height={13} />
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Skeleton width="42%" height={16} />
        <Skeleton width={78} height={24} radius={radius.pill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.sm + 2,
  },
  photo: { width: 56, height: 56, borderRadius: radius.md },
  dim: { opacity: 0.6 },
  body: { flex: 1, minWidth: 0, gap: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  when: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skeleton: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: 'hidden',
  },
});
