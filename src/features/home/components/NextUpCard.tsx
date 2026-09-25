import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { radius, shadows, spacing, useColors, type Colors } from '@/theme';

interface NextUpCardProps {
  storeName: string;
  logo?: string | null;
  dateLabel: string;
  timeLabel: string;
  servicesLabel: string;
  onPress: () => void;
}

export function NextUpCard({ storeName, logo, dateLabel, timeLabel, servicesLabel, onPress }: NextUpCardProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.avatarWrap}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <ThemedText variant="h3" color="textInverse">
              {storeName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <ThemedText variant="overline" color="textInverse" style={styles.eyebrow}>
          {t('home.nextUp')}
        </ThemedText>
        {/* Reuses `button`'s 15px/semibold metrics — this card's title needs the
            same weight/size, not a button. */}
        <ThemedText variant="button" color="textInverse" numberOfLines={1}>
          {storeName}
        </ThemedText>
        <ThemedText variant="caption" color="textInverse" numberOfLines={1}>
          {timeLabel} · {servicesLabel}
        </ThemedText>
      </View>
      <View style={styles.datePill}>
        <ThemedText variant="label" color="textInverse">
          {dateLabel}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function NoNextUpCard({ onExplore }: { onExplore: () => void }) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="calendar-outline" size={20} color={colors.brandAccent} />
      </View>
      <View style={styles.body}>
        <ThemedText variant="bodyMedium">{t('home.noUpcomingBookings')}</ThemedText>
        <Pressable onPress={onExplore} style={styles.exploreLink}>
          <ThemedText variant="captionStrong" color="brandAccent">
            {t('home.exploreNearby')}
          </ThemedText>
          <Ionicons name="arrow-forward" size={10} color={colors.brandAccent} />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.brandAccent,
      borderRadius: radius.lg,
      paddingHorizontal: 20,
      paddingVertical: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 2,
      ...shadows.md,
    },
    avatarWrap: { flexShrink: 0 },
    avatar: { width: 52, height: 52, borderRadius: radius.pill },
    avatarFallback: { backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1, minWidth: 0, gap: 3 },
    eyebrow: { textTransform: 'uppercase', letterSpacing: 1.1 },
    datePill: {
      flexShrink: 0,
      backgroundColor: 'rgba(255,255,255,0.14)',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radius.pill,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingHorizontal: 20,
      paddingVertical: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 2,
      ...shadows.sm,
    },
    emptyIconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.brandTint,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    exploreLink: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  });
