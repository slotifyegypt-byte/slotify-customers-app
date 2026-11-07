import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Photo } from '@/components/Photo';
import { Pill } from '@/components/Pill';
import { ThemedText } from '@/components/ThemedText';
import { spacing, useColors } from '@/theme';

interface TopRatedCardProps {
  name: string;
  logo?: string | null;
  category?: string;
  rating: number;
  distanceKm?: number | null;
  badge?: string;
  onPress: () => void;
}

/** A well-reviewed place nearby: photo, name, rating and how far it is. */
export function TopRatedCard({
  name,
  logo,
  rating,
  distanceKm,
  badge,
  onPress,
}: TopRatedCardProps) {
  const colors = useColors();
  return (
    <Card onPress={onPress} padding="none" style={styles.card} accessibilityLabel={name}>
      <Photo uri={logo} name={name} style={styles.photo} initialSize={36}>
        {badge ? (
          <View style={styles.badge}>
            <Pill label={badge} tone="brand" />
          </View>
        ) : null}
      </Photo>
      <View style={styles.content}>
        <ThemedText variant="captionStrong" numberOfLines={1}>
          {name}
        </ThemedText>
        <View style={styles.meta}>
          <Ionicons name="star" size={12} color={colors.ratingStar} />
          <ThemedText variant="label">{rating.toFixed(1)}</ThemedText>
          {distanceKm != null ? (
            <ThemedText variant="captionSmall" color="textTertiary">
              · {distanceKm.toFixed(1)} km
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { width: 172, marginEnd: spacing.sm },
  photo: { height: 108, width: '100%' },
  badge: { position: 'absolute', top: spacing.xs, start: spacing.xs },
  content: { padding: spacing.sm + 2, gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
