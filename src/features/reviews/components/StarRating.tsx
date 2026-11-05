import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useColors } from '@/theme';

interface StarRatingProps {
  rating: number;
  /** Makes the stars tappable. Without it the row is a read-only display. */
  onChange?: (rating: number) => void;
  size?: number;
  spacing?: number;
}

const STARS = [1, 2, 3, 4, 5];
const MIN_TARGET = 44;

/** One tappable star. It gives a little pop when a new rating includes it, so a choice feels answered. */
function Star({
  value,
  size,
  rating,
  onChange,
}: {
  value: number;
  size: number;
  rating: number;
  onChange: (rating: number) => void;
}) {
  const { t } = useTranslation();
  const colors = useColors();
  const [scale] = useState(() => new Animated.Value(1));
  const filled = value <= rating;
  const firstRun = useRef(true);

  useEffect(() => {
    // Not on mount, and only for the stars the new rating includes; they pop in turn from the left.
    if (firstRun.current) {
      firstRun.current = false;
      return undefined;
    }
    if (!filled) return undefined;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) return;
      Animated.sequence([
        Animated.delay((value - 1) * 45),
        Animated.spring(scale, {
          toValue: 1.28,
          useNativeDriver: Platform.OS !== 'web',
          speed: 50,
          bounciness: 10,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: Platform.OS !== 'web',
          speed: 30,
          bounciness: 6,
        }),
      ]).start();
    });
    return () => {
      cancelled = true;
    };
    // Re-run whenever the rating changes (`rating` is the rounded value).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rating]);

  const box = Math.max(size, MIN_TARGET);
  return (
    <Pressable
      onPress={() => onChange(value)}
      accessibilityRole="button"
      accessibilityLabel={t('reviews.starLabel', { count: value })}
      accessibilityState={{ selected: filled }}
      style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={filled ? 'star' : 'star-outline'}
          size={size}
          color={filled ? colors.ratingStar : colors.textTertiary}
        />
      </Animated.View>
    </Pressable>
  );
}

/** Five stars: a read-only rating, or (with `onChange`) big tappable stars that pop as they fill. */
export function StarRating({ rating, onChange, size = 22, spacing = 4 }: StarRatingProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const rounded = Math.round(rating);

  if (onChange) {
    return (
      <View style={styles.row} accessibilityRole="radiogroup">
        {STARS.map((value) => (
          <Star key={value} value={value} size={size} rating={rounded} onChange={onChange} />
        ))}
      </View>
    );
  }

  return (
    <View
      style={[styles.row, { gap: spacing }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('reviews.starsLabel', { count: rounded })}
    >
      {STARS.map((value) => (
        <Ionicons
          key={value}
          name="star"
          size={size}
          color={value <= rounded ? colors.ratingStar : colors.border}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
