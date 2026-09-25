import { Pressable, StyleSheet, View } from 'react-native';

import { fontFamily, radius, spacing, useColors, type Colors } from '@/theme';

import { ThemedText } from './ThemedText';

interface SegmentOption<T extends string> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  // 'accent' (bright purple) is the default, used for primary view-switch
  // controls (venue tab bar, Activity Active/Past). The reviews sort toggle
  // ("Most recent" / "Highest rated") is the one place the mockups use the
  // deep-navy `brand` fill instead — a secondary/lower-emphasis control
  // sharing a screen with an `accent`-filled control above it.
  tone?: 'accent' | 'brand';
}

// Shared pill-style segmented control — one implementation backing the
// Services/About/Reviews tab bar, the Reviews sort toggle, and the
// Activity Active/Past switch, instead of three near-identical one-offs.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  tone = 'accent',
}: SegmentedControlProps<T>) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.segment, selected && (tone === 'brand' ? styles.segmentSelectedBrand : styles.segmentSelected)]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <ThemedText
              variant="bodyMedium"
              color={selected ? 'textOnBrand' : 'textSecondary'}
              style={selected && styles.labelSelected}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    track: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundMuted,
      borderRadius: radius.pill,
      padding: 4,
    },
    segment: {
      flex: 1,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      alignItems: 'center',
    },
    // Bright-purple "selected" fill from the mockups (colors.brandAccent) —
    // `colors.brand` is the deep-navy tone reserved for dark header/hero
    // surfaces, not interactive selected states.
    segmentSelected: { backgroundColor: colors.brandAccent },
    segmentSelectedBrand: { backgroundColor: colors.brand },
    labelSelected: { fontFamily: fontFamily.bodySemiBold },
  });
