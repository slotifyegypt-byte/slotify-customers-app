import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { colors, radius, shadows, spacing } from '@/theme';

import { SoftGradient } from './SoftGradient';

interface DealCardProps {
  title: string;
  photo?: string | null;
  discountPercentage?: number | null;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  onPress: () => void;
}

// Matches 08-home-scrolled.png: a "-20%" badge top-left, title + a price row
// (original price struck through, discounted price bold) bottom-left. No
// `price_symbol` field exists on HomePageOfferRead — EGP is hardcoded here
// same as it is store-side for services without one.
export function DealCard({ title, photo, discountPercentage, originalPrice, discountedPrice, onPress }: DealCardProps) {
  const hasPrices = originalPrice != null && discountedPrice != null;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {photo ? (
        <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.imageFallback]} />
      )}
      <SoftGradient rgb={[15, 11, 36]} fromAlpha={0.05} toAlpha={0.82} direction="vertical" rampStart={0.4} />
      {discountPercentage ? (
        <View style={styles.tag}>
          <ThemedText variant="overline" color="textInverse">
            -{Math.round(discountPercentage)}%
          </ThemedText>
        </View>
      ) : null}
      <View style={styles.titleWrap}>
        <ThemedText variant="captionStrong" color="textInverse" numberOfLines={2}>
          {title}
        </ThemedText>
        {hasPrices ? (
          <View style={styles.priceRow}>
            <ThemedText variant="captionSmall" color="textInverse" style={styles.originalPrice}>
              {originalPrice} EGP
            </ThemedText>
            <ThemedText variant="captionStrong" color="textInverse">
              {discountedPrice} EGP
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 158,
    height: 158,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.xs,
    ...shadows.md,
  },
  imageFallback: { backgroundColor: colors.backgroundMuted },
  tag: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.brandAccent,
    paddingHorizontal: spacing.xs + 1,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  titleWrap: { position: 'absolute', left: spacing.xs + 2, right: spacing.xs + 2, bottom: spacing.xs + 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  originalPrice: { opacity: 0.75, textDecorationLine: 'line-through' },
});
