import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors, type Colors } from '@/theme';

import type { AvailabilityResponse, AvailabilitySlot } from '../api/schemas';
import { getBookingErrorMessage } from '../utils/bookingErrors';
import { mergeSpecialistSlots } from '../utils/slots';

interface SlotGridProps {
  availability: AvailabilityResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  selectedSlot: AvailabilitySlot | null;
  onSelectSlot: (slot: AvailabilitySlot) => void;
}

function slotKey(slot: AvailabilitySlot) {
  return `${slot.start_time}__${slot.employee_id ?? 'capacity'}`;
}

// developer-guide.md §6: `booking_mode` decides the shape — "specialist"
// groups slots per employee (employees[].available_slots), "capacity" is a
// flat list (slots[]) with capacity_remaining. The server only returns FREE
// slots (after now, clear of bookings), so every pill is tappable; taken
// times simply don't appear.
//
// Specialist mode is always one flat 3-column grid (24-booking-configure.png
// "DATE & TIME" never shows per-specialist subheadings): with "Any
// Professional" the employees are merged earliest-first by
// mergeSpecialistSlots, and the tapped slot's employee_id is what gets booked.
// A tapped slot gets an obvious filled/selected treatment.
export function SlotGrid({ availability, isLoading, isError, error, selectedSlot, onSelectSlot }: SlotGridProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const specialistSlots = useMemo(
    () => (availability?.booking_mode === 'specialist' ? mergeSpecialistSlots(availability.employees) : []),
    [availability],
  );

  if (isLoading) {
    return <ActivityIndicator style={styles.spinner} color={colors.brand} />;
  }

  if (isError) {
    // The backend's own detail (e.g. "No employees found for this service")
    // is usually more accurate than a generic error — and often describes an
    // expected, calm empty state rather than an actual failure.
    return <EmptyState title={getBookingErrorMessage(error, "Couldn't load availability for this date.")} /* TODO i18n */ />;
  }

  if (!availability) {
    return null;
  }

  if (availability.booking_mode === 'specialist') {
    if (specialistSlots.length === 0) {
      return <EmptyState title="No open slots on this date" />; /* TODO i18n */
    }
    return (
      <View style={styles.grid}>
        {specialistSlots.map((slot) => {
          const key = slotKey(slot);
          const isSelected = selectedSlot !== null && slotKey(selectedSlot) === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectSlot(slot)}
              style={[styles.slot, isSelected && styles.slotSelected]}
            >
              <ThemedText variant="bodyMedium" color={isSelected ? 'textOnBrand' : 'textPrimary'}>
                {slot.time_slot_str}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (availability.slots.length === 0) {
    return <EmptyState title="No open slots on this date" />; /* TODO i18n */
  }

  return (
    <View style={styles.grid}>
      {availability.slots.map((slot) => {
        const key = slotKey(slot);
        const isSelected = selectedSlot !== null && slotKey(selectedSlot) === key;
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectSlot(slot)}
            style={[styles.slot, styles.capacitySlot, isSelected && styles.slotSelected]}
          >
            <ThemedText variant="bodyMedium" color={isSelected ? 'textOnBrand' : 'textPrimary'}>
              {slot.time_slot_str}
            </ThemedText>
            {slot.capacity_remaining !== null ? (
              <ThemedText variant="caption" color={isSelected ? 'textOnBrand' : 'textSecondary'}>
                {/* TODO i18n */}
                {slot.capacity_remaining} left
              </ThemedText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  spinner: { marginVertical: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  slot: {
    // Fixed 3-column grid (per design) rather than a min-width wrap, which
    // could lay out 2 or 4 per row depending on screen width.
    flexBasis: '31%',
    flexGrow: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  capacitySlot: { minHeight: 52, justifyContent: 'center' },
  slotSelected: { backgroundColor: colors.brandAccent, borderColor: colors.brandAccent },
});
