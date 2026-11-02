import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors, type Colors } from '@/theme';

import { branchDateStrip } from '../utils/dates';

interface DateStripProps {
  /** Branch-local "YYYY-MM-DD". */
  selectedDate: string;
  /** The BRANCH's IANA timezone — "today" is the branch's today, not the phone's. */
  timezone: string;
  onSelectDate: (date: string) => void;
  daysAhead?: number;
}

/** Simple horizontal date strip for the next N branch-local days — no calendar library needed (per spec). */
export function DateStrip({ selectedDate, timezone, onSelectDate, daysAhead = 14 }: DateStripProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const days = useMemo(() => branchDateStrip(timezone, daysAhead), [timezone, daysAhead]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {days.map(({ value, weekday, day }) => {
        const isSelected = value === selectedDate;
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectDate(value)}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <ThemedText variant="caption" color={isSelected ? 'textOnBrand' : 'textSecondary'}>
              {weekday}
            </ThemedText>
            <ThemedText variant="h3" color={isSelected ? 'textOnBrand' : 'textPrimary'}>
              {day}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  // Without an explicit style, an unconstrained ScrollView placed inside a
  // `flex: 1` ancestor (RescheduleBookingScreen) stretches to fill that
  // ambiguous main-axis space on iOS instead of sizing to its content —
  // `flexGrow: 0` pins it to its natural (content) height everywhere,
  // including where it already worked (BookingFlow's own ScrollView).
  scroll: { flexGrow: 0 },
  row: { paddingVertical: spacing.xs },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    marginRight: spacing.xs,
    backgroundColor: colors.backgroundMuted,
  },
  // Selected-state purple: `brandAccent` (bright purple) is the mockups'
  // "selected/CTA accent" color — `brand` (deep navy) is reserved for dark
  // header/summary surfaces (see colors.ts), so using it here washed the
  // selected pill out to near-black instead of the mockup's mid-purple.
  chipSelected: { backgroundColor: colors.brandAccent },
});
