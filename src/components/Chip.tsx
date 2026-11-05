import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';

import { radius, spacing, useColors } from '@/theme';

import { PressableScale } from './PressableScale';
import { ThemedText } from './ThemedText';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
}

/** A selectable filter chip: filled with the brand colour when chosen, an outlined surface when not. */
export function Chip({ label, selected = false, onPress, icon }: ChipProps) {
  const colors = useColors();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      scaleTo={0.95}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: colors.brand, borderColor: colors.brand }
          : { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={15}
          color={selected ? colors.textOnBrand : colors.textSecondary}
        />
      ) : null}
      <ThemedText
        variant="bodyMedium"
        color={selected ? 'textOnBrand' : 'textPrimary'}
        style={styles.label}
      >
        {label}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md - 2,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  label: { fontSize: 14, lineHeight: 18 },
});
