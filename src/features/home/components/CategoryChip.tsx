import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { colors, radius, spacing } from '@/theme';

import { iconForCategory, imageForCategory, pinColorForCategory, tintForCategory } from '../utils/categoryIcon';

interface CategoryChipProps {
  name: string;
  selected?: boolean;
  muted?: boolean;
  onPress: () => void;
}

export function CategoryChip({ name, selected, muted, onPress }: CategoryChipProps) {
  const image = imageForCategory(name);
  // Fixed reference so the Image's style array doesn't get a new object
  // identity every render (was causing expo-image to re-transition on every
  // sibling selection change).
  const imageStyle = useMemo(
    () => [styles.image, image ? { transform: [{ scale: image.scale }] } : null],
    [image],
  );

  return (
    <Pressable onPress={onPress} style={[styles.wrap, muted && styles.muted]}>
      <View style={styles.circleOuter}>
        <View style={[styles.circle, !image && { backgroundColor: tintForCategory(name) }]}>
          {image ? (
            <Image source={image.source} style={imageStyle} contentFit="cover" />
          ) : (
            <Ionicons name={iconForCategory(name)} size={26} color={pinColorForCategory(name)} />
          )}
        </View>
        {/* Separate, non-clipping overlay so the selection ring never resizes
            or re-clips the image circle underneath it. */}
        {selected ? <View pointerEvents="none" style={styles.selectionRing} /> : null}
      </View>
      <ThemedText
        variant={selected ? 'label' : 'captionSmall'}
        color={selected ? 'brand' : 'textSecondary'}
        numberOfLines={1}
        style={styles.label}
      >
        {name}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xxs, width: 66, marginRight: spacing.xs },
  muted: { opacity: 0.4 },
  circleOuter: { width: 60, height: 60 },
  circle: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectionRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    borderWidth: 2.5,
    borderColor: colors.brandAccent,
  },
  image: { width: '100%', height: '100%' },
  label: { textAlign: 'center' },
});
