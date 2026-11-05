import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors, useTheme, type Colors } from '@/theme';

import {
  iconForCategory,
  imageForCategory,
  pinColorForCategory,
  tintForCategory,
} from '../utils/categoryIcon';

interface CategoryChipProps {
  name: string;
  slug: string;
  selected?: boolean;
  muted?: boolean;
  onPress: () => void;
}

export function CategoryChip({ name, slug, selected, muted, onPress }: CategoryChipProps) {
  const colors = useColors();
  const { scheme } = useTheme();
  const styles = createStyles(colors);
  const image = imageForCategory(slug, scheme);

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ selected: !!selected }}
      scaleTo={0.94}
      style={[styles.wrap, muted && styles.muted]}
    >
      <View style={styles.circleOuter}>
        <View style={[styles.circle, !image && { backgroundColor: tintForCategory(slug, colors) }]}>
          {image ? (
            <Image source={image.source} style={styles.image} contentFit="cover" />
          ) : (
            <Ionicons
              name={iconForCategory(slug)}
              size={26}
              color={pinColorForCategory(slug, colors)}
            />
          )}
        </View>
        {/* Separate, non-clipping overlay so the selection ring never resizes
            or re-clips the image circle underneath it. */}
        {selected ? <View pointerEvents="none" style={styles.selectionRing} /> : null}
      </View>
      <ThemedText
        variant={selected ? 'captionStrong' : 'caption'}
        color={selected ? 'textPrimary' : 'textSecondary'}
        numberOfLines={1}
        style={styles.label}
      >
        {name}
      </ThemedText>
    </PressableScale>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    wrap: { alignItems: 'center', gap: 6, width: 72, marginRight: spacing.xs },
    muted: { opacity: 0.5 },
    circleOuter: { width: 64, height: 64 },
    circle: {
      width: 64,
      height: 64,
      borderRadius: radius.pill,
      backgroundColor: colors.backgroundMuted,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    selectionRing: {
      position: 'absolute',
      top: -4,
      left: -4,
      width: 72,
      height: 72,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: colors.brand,
    },
    image: { width: '100%', height: '100%' },
    label: { textAlign: 'center' },
  });
