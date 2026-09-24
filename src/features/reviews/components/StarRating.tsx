import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  spacing?: number;
}

const STARS = [1, 2, 3, 4, 5];

export function StarRating({ rating, onChange, size = 22, spacing = 4 }: StarRatingProps) {
  const readonly = !onChange;

  return (
    <View style={styles.row}>
      {STARS.map((value) => {
        const filled = value <= Math.round(rating);
        const star = (
          <SymbolView
            name={{ ios: filled ? 'star.fill' : 'star', android: 'star', web: 'star' }}
            tintColor={filled ? colors.ratingStar : colors.border}
            size={size}
          />
        );
        return readonly ? (
          <View key={value} style={{ marginRight: spacing }}>
            {star}
          </View>
        ) : (
          <Pressable key={value} onPress={() => onChange?.(value)} style={{ marginRight: spacing }} hitSlop={4}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
