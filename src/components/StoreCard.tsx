import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, shadows, spacing, useColors, type Colors } from '@/theme';

import { ThemedText } from './ThemedText';

interface StoreCardProps {
  name: string;
  logo?: string | null;
  address?: string | null;
  rating: number;
  distanceKm?: number | null;
  isOpen?: boolean;
  onPress?: () => void;
  width?: number;
}

export function StoreCard({ name, logo, address, rating, distanceKm, isOpen, onPress, width = 220 }: StoreCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <Pressable onPress={onPress} style={[styles.card, { width }]}>
      <View style={styles.imageWrap}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]} />
        )}
        {isOpen !== undefined ? (
          <View style={[styles.statusPill, { backgroundColor: isOpen ? colors.success : colors.textSecondary }]}>
            <ThemedText variant="caption" color="textInverse">
              {isOpen ? 'Open' : 'Closed'}
            </ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText variant="h3" numberOfLines={1} style={styles.name}>
        {name}
      </ThemedText>
      {address ? (
        <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
          {address}
        </ThemedText>
      ) : null}
      <View style={styles.metaRow}>
        <ThemedText variant="caption" color="textSecondary">
          ★ {rating.toFixed(1)}
        </ThemedText>
        {distanceKm != null ? (
          <ThemedText variant="caption" color="textSecondary">
            {' '}
            · {distanceKm.toFixed(1)} km
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    card: { marginRight: spacing.sm },
    imageWrap: { position: 'relative', marginBottom: spacing.xxs },
    image: { width: '100%', height: 120, borderRadius: radius.md },
    imageFallback: { backgroundColor: colors.backgroundMuted },
    statusPill: {
      position: 'absolute',
      top: spacing.xxs,
      left: spacing.xxs,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: radius.pill,
      ...shadows.sm,
    },
    name: { marginTop: spacing.xxs },
    metaRow: { flexDirection: 'row', marginTop: 2 },
  });
