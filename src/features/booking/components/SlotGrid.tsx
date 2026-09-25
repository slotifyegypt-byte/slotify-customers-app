import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors, type Colors } from '@/theme';

import type { AvailabilityResponse, AvailabilitySlot } from '../api/schemas';
import { getBookingErrorMessage } from '../utils/apiError';

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

// "Specialist" mode returns availability grouped per employee
// (data.employees[].available_slots). When the customer has "Any
// Professional" selected there's no single employee to group by, and the
// design (24-booking-configure.png "DATE & TIME") never shows per-specialist
// subheadings anyway — it's always one flat 3-column grid. So flatten across
// employees here, deduping by start_time and preferring whichever employee is
// actually available at that time; the winning slot's employee_id is what
// gets booked if the customer taps it (consistent with "Any specialist"
// resolving to a concrete employee only once a slot is picked).
function flattenSpecialistSlots(employees: AvailabilityResponse['employees']): AvailabilitySlot[] {
  const byStart = new Map<string, AvailabilitySlot>();
  for (const employee of employees) {
    for (const slot of employee.available_slots) {
      const existing = byStart.get(slot.start_time);
      if (!existing || (!existing.is_available && slot.is_available)) {
        byStart.set(slot.start_time, slot);
      }
    }
  }
  return Array.from(byStart.values()).sort((a, b) => a.start_time.localeCompare(b.start_time));
}

// customer-app-api-map.md §6: `booking_mode` decides the shape — "specialist"
// groups slots per employee (data.employees[].available_slots), "capacity"
// is a flat list (data.slots[]) with capacity_remaining/capacity_total.
//
// Design ref: unavailable/past slots (e.g. "2:30", "4:00") render as
// struck-through, greyed, disabled pills in a fixed 3-column grid — both
// visual cues together, not just one — and a tapped slot gets an obvious
// filled/selected treatment distinct from both.
export function SlotGrid({ availability, isLoading, isError, error, selectedSlot, onSelectSlot }: SlotGridProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const specialistSlots = useMemo(
    () => (availability?.booking_mode === 'specialist' ? flattenSpecialistSlots(availability.employees) : []),
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
          const isDisabled = !slot.is_available;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              disabled={isDisabled}
              onPress={() => onSelectSlot(slot)}
              style={[styles.slot, isSelected && styles.slotSelected, isDisabled && styles.slotDisabled]}
            >
              <ThemedText
                variant="bodyMedium"
                color={isSelected ? 'textOnBrand' : isDisabled ? 'disabledText' : 'textPrimary'}
                style={isDisabled && styles.slotTextDisabled}
              >
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
        const isDisabled = !slot.is_available;
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            disabled={isDisabled}
            onPress={() => onSelectSlot(slot)}
            style={[styles.slot, styles.capacitySlot, isSelected && styles.slotSelected, isDisabled && styles.slotDisabled]}
          >
            <ThemedText
              variant="bodyMedium"
              color={isSelected ? 'textOnBrand' : isDisabled ? 'disabledText' : 'textPrimary'}
              style={isDisabled && styles.slotTextDisabled}
            >
              {slot.time_slot_str}
            </ThemedText>
            {!isDisabled ? (
              <ThemedText variant="caption" color={isSelected ? 'textOnBrand' : 'textSecondary'}>
                {/* TODO i18n */}
                {slot.capacity_remaining}/{slot.capacity_total} left
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
  slotDisabled: { backgroundColor: colors.backgroundMuted, borderColor: colors.divider },
  slotTextDisabled: { textDecorationLine: 'line-through' },
});
