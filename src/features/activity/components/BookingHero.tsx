import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Photo } from '@/components/Photo';
import { ThemedText } from '@/components/ThemedText';
import type { BookingRead } from '@/features/booking/api/schemas';
import { formatCountdown } from '@/features/home/utils/countdown';
import { formatHour } from '@/lib/time/branchTime';
import { radius, shadows, spacing, useColors } from '@/theme';

import { bookingStatusMeta } from '../utils/bookingDisplay';
import { longDayLabel } from '../utils/dateLabels';

/** The booking's end: the latest end among its services. */
export function bookingEnd(booking: Pick<BookingRead, 'booking_services'>): string | null {
  let latest: string | null = null;
  for (const item of booking.booking_services) {
    if (!latest || Date.parse(item.booking_end_time) > Date.parse(latest)) {
      latest = item.booking_end_time;
    }
  }
  return latest;
}

/**
 * The one hero surface on the booking page: deep indigo with the venue, the state in words, and the day and time
 * as the largest thing on it.
 */
export function BookingHero({ booking }: { booking: BookingRead }) {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const meta = bookingStatusMeta(booking);
  const countdown =
    booking.booking_status === 'confirmed' ? formatCountdown(booking.booking_date, '') : '';
  const end = bookingEnd(booking);
  const start = formatHour(booking.booking_date, booking.timezone);
  const time = end ? `${start} – ${formatHour(end, booking.timezone)}` : start;

  return (
    <View style={[styles.card, shadows.md, { backgroundColor: colors.hero }]}>
      <View
        pointerEvents="none"
        style={[styles.ring, styles.ringBig, { borderColor: colors.onHeroTint }]}
      />
      <View
        pointerEvents="none"
        style={[styles.ring, styles.ringSmall, { borderColor: colors.onHeroTint }]}
      />

      <View style={styles.chips}>
        <View style={[styles.chip, { backgroundColor: colors.onHeroTint }]}>
          <ThemedText variant="label" color="onHero">
            {t(meta.labelKey)}
          </ThemedText>
        </View>
        {countdown ? (
          <View style={[styles.chip, { backgroundColor: colors.onHeroTint }]}>
            <View style={[styles.dot, { backgroundColor: colors.mint }]} />
            <ThemedText variant="label" color="onHero">
              {countdown}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.venue}>
        <Photo
          uri={booking.store_logo}
          name={booking.store_name}
          style={styles.photo}
          initialSize={24}
          tone="onDark"
        />
        <View style={styles.venueText}>
          <ThemedText variant="h2" color="onHero" numberOfLines={2}>
            {booking.store_name}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.rule, { backgroundColor: colors.onHeroTint }]} />

      <View style={styles.when}>
        <ThemedText variant="h2" color="onHero">
          {longDayLabel(booking.booking_date, booking.timezone, i18n.language)}
        </ThemedText>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={16} color={colors.onHeroMuted} />
          <ThemedText variant="bodyLarge" color="onHeroMuted">
            {time}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.md + 4, gap: spacing.md, overflow: 'hidden' },
  ring: { position: 'absolute', borderWidth: 1.5, borderRadius: 999 },
  ringBig: { width: 190, height: 190, end: -60, top: -80 },
  ringSmall: { width: 110, height: 110, end: -20, top: -40 },
  chips: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  venue: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  photo: { width: 56, height: 56, borderRadius: radius.md },
  venueText: { flex: 1, minWidth: 0 },
  rule: { height: StyleSheet.hairlineWidth * 2 },
  when: { gap: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
