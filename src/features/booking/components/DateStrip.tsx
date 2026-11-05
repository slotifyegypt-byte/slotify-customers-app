import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors } from '@/theme';

import { branchDateStrip } from '../utils/dates';

interface DateStripProps {
  /** Branch-local "YYYY-MM-DD". */
  selectedDate: string;
  /** The BRANCH's IANA timezone: "today" is the branch's today, not the phone's. */
  timezone: string;
  onSelectDate: (date: string) => void;
  daysAhead?: number;
  /** Lets the strip run to the screen edge: pass the screen's side margin and it cancels it, then pads itself. */
  bleed?: number;
}

/** A horizontal strip of the next N branch-local days: tall, easy targets with the chosen day filled in brand. */
export function DateStrip({
  selectedDate,
  timezone,
  onSelectDate,
  daysAhead = 14,
  bleed = 0,
}: DateStripProps) {
  const colors = useColors();
  const days = useMemo(() => branchDateStrip(timezone, daysAhead), [timezone, daysAhead]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, bleed ? { marginHorizontal: -bleed } : null]}
      contentContainerStyle={[styles.row, bleed ? { paddingHorizontal: bleed } : null]}
    >
      {days.map(({ value, weekday, day }) => {
        const isSelected = value === selectedDate;
        return (
          <PressableScale
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`${weekday} ${day}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectDate(value)}
            scaleTo={0.94}
            style={[
              styles.chip,
              isSelected
                ? { backgroundColor: colors.brand, borderColor: colors.brand }
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ThemedText variant="caption" color={isSelected ? 'textOnBrand' : 'textSecondary'}>
              {weekday}
            </ThemedText>
            <ThemedText variant="h3" color={isSelected ? 'textOnBrand' : 'textPrimary'}>
              {day}
            </ThemedText>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Without an explicit style, an unconstrained ScrollView placed inside a
  // `flex: 1` ancestor (RescheduleBookingScreen) stretches to fill that
  // ambiguous main-axis space on iOS instead of sizing to its content;
  // `flexGrow: 0` pins it to its natural (content) height everywhere.
  scroll: { flexGrow: 0 },
  row: { paddingVertical: spacing.xxs, gap: spacing.xs },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 56,
    height: 68,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
