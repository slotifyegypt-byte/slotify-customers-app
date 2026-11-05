import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Photo } from '@/components/Photo';
import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { radius, shadows, spacing, useColors } from '@/theme';

interface NextUpCardProps {
  storeName: string;
  logo?: string | null;
  dateLabel: string;
  timeLabel: string;
  servicesLabel: string;
  onPress: () => void;
}

/** The one hero card on Home: the next appointment, on deep indigo, with how soon it is. */
export function NextUpCard({
  storeName,
  logo,
  dateLabel,
  timeLabel,
  servicesLabel,
  onPress,
}: NextUpCardProps) {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('home.nextUp')}: ${storeName}, ${dateLabel}, ${timeLabel}`}
      scaleTo={0.985}
      style={[styles.card, shadows.md, { backgroundColor: colors.hero }]}
    >
      {/* Two soft rings in the corner: a quiet nod to the logo's calendar-and-motion mark. */}
      <View
        pointerEvents="none"
        style={[styles.ring, styles.ringBig, { borderColor: colors.onHeroTint }]}
      />
      <View
        pointerEvents="none"
        style={[styles.ring, styles.ringSmall, { borderColor: colors.onHeroTint }]}
      />

      <View style={styles.top}>
        <View style={styles.eyebrow}>
          <View style={[styles.dot, { backgroundColor: colors.mint }]} />
          <ThemedText variant="label" color="onHeroMuted">
            {t('home.nextUp')}
          </ThemedText>
        </View>
        <View style={[styles.when, { backgroundColor: colors.onHeroTint }]}>
          <ThemedText variant="label" color="onHero">
            {dateLabel}
          </ThemedText>
        </View>
      </View>

      <View style={styles.main}>
        <Photo uri={logo} name={storeName} style={styles.avatar} initialSize={22} tone="onDark" />
        <View style={styles.body}>
          <ThemedText variant="h3" color="onHero" numberOfLines={1}>
            {storeName}
          </ThemedText>
          <ThemedText variant="caption" color="onHeroMuted" numberOfLines={1}>
            {servicesLabel}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.time, { backgroundColor: colors.onHeroTint }]}>
        <Ionicons name="time-outline" size={16} color={colors.onHero} />
        <ThemedText variant="bodyMedium" color="onHero">
          {timeLabel}
        </ThemedText>
        <View style={styles.flex} />
        <Ionicons name="arrow-forward" size={16} color={colors.onHero} />
      </View>
    </PressableScale>
  );
}

/** Shown in the same place when nothing is booked: what to do about it, as a quiet card rather than a hole. */
export function NoNextUpCard({ onExplore }: { onExplore: () => void }) {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Card onPress={onExplore} accessibilityLabel={t('home.exploreNearby')}>
      <View style={styles.empty}>
        <View style={[styles.emptyWell, { backgroundColor: colors.brandTint }]}>
          <Ionicons name="calendar-outline" size={22} color={colors.brandAccent} />
        </View>
        <View style={styles.body}>
          <ThemedText variant="bodyMedium">{t('home.noUpcomingBookings')}</ThemedText>
          <View style={styles.link}>
            <ThemedText variant="captionStrong" color="brandAccent">
              {t('home.exploreNearby')}
            </ThemedText>
            <Ionicons name="arrow-forward" size={12} color={colors.brandAccent} />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.md + 2, gap: spacing.md, overflow: 'hidden' },
  ring: { position: 'absolute', borderWidth: 1.5, borderRadius: 999 },
  ringBig: { width: 190, height: 190, right: -60, top: -80 },
  ringSmall: { width: 110, height: 110, right: -20, top: -40 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  when: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill },
  main: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  avatar: { width: 52, height: 52, borderRadius: radius.md },
  body: { flex: 1, minWidth: 0, gap: 2 },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  flex: { flex: 1 },
  empty: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  emptyWell: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
});
