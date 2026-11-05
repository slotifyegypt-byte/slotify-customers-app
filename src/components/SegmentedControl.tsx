import { StyleSheet, View } from 'react-native';

import { radius, shadows, spacing, useColors } from '@/theme';

import { PressableScale } from './PressableScale';
import { ThemedText } from './ThemedText';

interface SegmentOption<T extends string> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** accent: a white thumb on the track (the default). brand: a filled brand thumb. */
  tone?: 'accent' | 'brand';
}

/** Two to four choices in one pill: the chosen one sits on a raised thumb. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  tone = 'accent',
}: SegmentedControlProps<T>) {
  const colors = useColors();
  return (
    <View style={[styles.track, { backgroundColor: colors.backgroundMuted }]}>
      {options.map((option) => {
        const selected = option.key === value;
        const filled = selected && tone === 'brand';
        return (
          <PressableScale
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            scaleTo={0.97}
            style={[
              styles.segment,
              selected
                ? [shadows.sm, { backgroundColor: filled ? colors.brand : colors.surface }]
                : null,
            ]}
          >
            <ThemedText
              variant={selected ? 'captionStrong' : 'caption'}
              color={filled ? 'textOnBrand' : selected ? 'textPrimary' : 'textTertiary'}
              style={styles.label}
            >
              {option.label}
            </ThemedText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: radius.pill, padding: 4 },
  segment: {
    flex: 1,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  label: { fontSize: 14, lineHeight: 18 },
});
