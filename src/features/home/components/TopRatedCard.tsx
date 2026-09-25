import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { radius, shadows, spacing, useColors, type Colors } from '@/theme';

interface TopRatedCardProps {
  name: string;
  logo?: string | null;
  category?: string;
  rating: number;
  distanceKm?: number | null;
  badge?: string;
  onPress: () => void;
}

export function TopRatedCard({ name, logo, rating, distanceKm, badge, onPress }: TopRatedCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]} />
        )}
        {badge ? (
          <View style={styles.badge}>
            <ThemedText variant="overline" color="textInverse" style={styles.badgeText}>
              {badge}
            </ThemedText>
          </View>
        ) : null}
      </View>
      <View style={styles.content}>
        <ThemedText variant="captionStrong" numberOfLines={1}>
          {name}
        </ThemedText>
        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={colors.warning} />
            <ThemedText variant="label">{rating.toFixed(1)}</ThemedText>
          </View>
          {distanceKm != null ? (
            <ThemedText variant="captionSmall" color="textSecondary">
              {distanceKm.toFixed(1)} km
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      width: 150,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      overflow: 'hidden',
      marginRight: spacing.xs,
      ...shadows.sm,
    },
    imageWrap: { height: 96, position: 'relative' },
    image: { width: '100%', height: '100%' },
    imageFallback: { backgroundColor: colors.backgroundMuted },
    badge: {
      position: 'absolute',
      top: spacing.xxs,
      left: spacing.xxs,
      backgroundColor: colors.brandAccent,
      paddingHorizontal: spacing.xs,
      paddingVertical: 3,
      borderRadius: radius.pill,
    },
    badgeText: { letterSpacing: 0.3, textTransform: 'uppercase' },
    content: { padding: spacing.xs + 2, gap: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  });
