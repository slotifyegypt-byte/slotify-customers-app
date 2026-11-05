import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useColors } from '@/theme';

interface RatingStarsProps {
  rating: number;
  size?: number;
}

/** Five read-only stars: filled up to the rounded rating, an outline for the rest. */
export function RatingStars({ rating, size = 14 }: RatingStarsProps) {
  const colors = useColors();
  const filled = Math.round(rating);
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${rating.toFixed(1)} out of 5 stars`} // TODO i18n
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Ionicons
          key={value}
          name={value <= filled ? 'star' : 'star-outline'}
          size={size}
          color={value <= filled ? colors.ratingStar : colors.border}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 2 } });
