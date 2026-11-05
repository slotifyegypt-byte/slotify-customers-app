import { StyleSheet, View } from 'react-native';

import { Photo } from '@/components/Photo';
import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { formatMoney } from '@/lib/money';
import { radius, shadows, spacing, useColors } from '@/theme';

import { SoftGradient } from './SoftGradient';

interface DealCardProps {
  title: string;
  photo?: string | null;
  discountPercentage?: number | null;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  currency?: string | null;
  /** Names the business, for the placeholder shown while the offer has no picture. */
  placeholderName?: string;
  onPress: () => void;
}

/** An offer: its picture under a dark wash with the title and the new price on top, and the discount as a badge. */
export function DealCard({
  title,
  photo,
  discountPercentage,
  originalPrice,
  discountedPrice,
  currency,
  placeholderName,
  onPress,
}: DealCardProps) {
  const colors = useColors();
  const hasPrices = originalPrice != null && discountedPrice != null && !!currency;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      scaleTo={0.97}
      style={[styles.card, shadows.md]}
    >
      <Photo
        uri={photo}
        name={placeholderName ?? title}
        style={StyleSheet.absoluteFill}
        initialSize={48}
      />
      <SoftGradient
        rgb={[21, 17, 43]}
        fromAlpha={0.04}
        toAlpha={0.86}
        direction="vertical"
        rampStart={0.35}
      />
      {discountPercentage ? (
        <View style={[styles.tag, { backgroundColor: colors.mint }]}>
          <ThemedText variant="label" style={styles.tagText}>
            {Math.round(discountPercentage)}% off
          </ThemedText>
        </View>
      ) : null}
      <View style={styles.titleWrap}>
        <ThemedText variant="captionStrong" color="onHero" numberOfLines={2}>
          {title}
        </ThemedText>
        {hasPrices ? (
          <View style={styles.priceRow}>
            <ThemedText variant="captionStrong" color="onHero">
              {formatMoney(discountedPrice, currency)}
            </ThemedText>
            <ThemedText variant="captionSmall" color="onHeroMuted" style={styles.originalPrice}>
              {formatMoney(originalPrice, currency)}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 172,
    height: 172,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  tag: {
    position: 'absolute',
    top: spacing.xs + 2,
    left: spacing.xs + 2,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: { color: '#15112B' },
  titleWrap: {
    position: 'absolute',
    left: spacing.sm + 2,
    right: spacing.sm + 2,
    bottom: spacing.sm + 2,
    gap: 3,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  originalPrice: { textDecorationLine: 'line-through' },
});
