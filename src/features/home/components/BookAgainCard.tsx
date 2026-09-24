import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { colors, radius, shadows, spacing } from '@/theme';

interface BookAgainCardProps {
  name: string;
  logo?: string | null;
  serviceLabel: string;
  ctaLabel: string;
  onPress: () => void;
  onCtaPress: () => void;
}

export function BookAgainCard({ name, logo, serviceLabel, ctaLabel, onPress, onCtaPress }: BookAgainCardProps) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]} />
        )}
        <View style={styles.textWrap}>
          <ThemedText variant="captionStrong" numberOfLines={1}>
            {name}
          </ThemedText>
          <ThemedText variant="captionSmall" color="textSecondary" numberOfLines={1}>
            {serviceLabel}
          </ThemedText>
        </View>
      </Pressable>
      <Pressable onPress={onCtaPress} style={styles.cta}>
        <ThemedText variant="label" color="brandAccent">
          {ctaLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 132,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
    marginRight: spacing.xs,
    ...shadows.sm,
  },
  image: { width: '100%', height: 78, borderRadius: radius.sm },
  imageFallback: { backgroundColor: colors.backgroundMuted },
  textWrap: { marginTop: spacing.xxs, gap: 2 },
  cta: {
    backgroundColor: colors.brandTint,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
});
