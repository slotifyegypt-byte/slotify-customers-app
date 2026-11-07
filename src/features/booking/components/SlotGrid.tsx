import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { PressableScale } from '@/components/PressableScale';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors } from '@/theme';

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

const COLUMNS = 3;
const GAP = spacing.xs;

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

function slotKey(slot: AvailabilitySlot) {
  return `${slot.start_time}__${slot.employee_id ?? 'capacity'}`;
}

type DayPart = 'morning' | 'afternoon' | 'evening';

// `time_slot_str` is already the branch-local "10:00 AM" (or "10:00 ص" in Arabic), so the day part reads the
// branch's clock, never the phone's.
export function dayPartOf(slot: AvailabilitySlot): DayPart {
  const match = /^(\d{1,2}):\d{2}\s*(AM|PM|ص|م)/i.exec(slot.time_slot_str);
  if (!match) return 'morning';
  const isPm = match[2].toUpperCase() === 'PM' || match[2] === 'م';
  const hour = (Number(match[1]) % 12) + (isPm ? 12 : 0);
  return hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
}

// developer-guide.md §6: `booking_mode` decides the shape: "specialist"
// groups slots per employee (employees[].available_slots), "capacity" is a
// flat list (slots[]) with capacity_remaining. The server only returns FREE
// slots (after now, clear of bookings), so every time is tappable; taken
// times simply don't appear.
//
// Specialist mode is always one flat grid (never per-specialist subheadings):
// with "Any professional" the employees are merged earliest-first by
// mergeSpecialistSlots, and the tapped slot's employee_id is what gets booked.
// Times are grouped Morning / Afternoon / Evening (a heading only appears when
// the day spans more than one part), three to a row.
export function SlotGrid({
  availability,
  isLoading,
  isError,
  error,
  selectedSlot,
  onSelectSlot,
}: SlotGridProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const specialistSlots = useMemo(
    () =>
      availability?.booking_mode === 'specialist'
        ? mergeSpecialistSlots(availability.employees)
        : [],
    [availability],
  );
  const slots = availability?.booking_mode === 'specialist' ? specialistSlots : availability?.slots;

  const groups = useMemo(() => {
    const byPart = new Map<DayPart, AvailabilitySlot[]>();
    for (const slot of slots ?? []) {
      const part = dayPartOf(slot);
      byPart.set(part, [...(byPart.get(part) ?? []), slot]);
    }
    return (['morning', 'afternoon', 'evening'] as const)
      .filter((part) => byPart.has(part))
      .map((part) => ({ part, slots: byPart.get(part) ?? [] }));
  }, [slots]);

  if (isLoading) {
    return (
      <View style={styles.grid}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.row}>
            {[0, 1, 2].map((col) => (
              <Skeleton key={col} style={styles.cell} height={48} radius={radius.md} />
            ))}
          </View>
        ))}
      </View>
    );
  }

  if (isError) {
    // The backend's own detail (e.g. "No employees found for this service")
    // is usually more accurate than a generic error, and often describes an
    // expected, calm empty state rather than an actual failure.
    return (
      <EmptyState
        icon="calendar-outline"
        title={getBookingErrorMessage(error, t('booking.availabilityError'))}
      />
    );
  }

  if (!availability) {
    return null;
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title={t('booking.noOpenTimes')}
        body={t('booking.noOpenTimesBody')}
      />
    );
  }

  return (
    <View style={styles.groups}>
      {groups.map((group) => (
        <View key={group.part} style={styles.group}>
          {groups.length > 1 ? (
            <ThemedText variant="captionStrong" color="textSecondary">
              {t(`booking.${group.part}`)}
            </ThemedText>
          ) : null}
          <View style={styles.grid}>
            {chunk(group.slots, COLUMNS).map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {Array.from({ length: COLUMNS }, (_, col) => row[col]).map((slot, col) => {
                  if (!slot)
                    return (
                      <View
                        key={`pad-${col}`}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        style={[styles.slot, styles.pad]}
                      />
                    );
                  const key = slotKey(slot);
                  const isSelected = selectedSlot !== null && slotKey(selectedSlot) === key;
                  const showCapacity =
                    availability.booking_mode === 'capacity' && slot.capacity_remaining !== null;
                  return (
                    <PressableScale
                      key={key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={
                        showCapacity
                          ? `${slot.time_slot_str}, ${t('booking.spotsLeft', { count: slot.capacity_remaining })}`
                          : slot.time_slot_str
                      }
                      onPress={() => onSelectSlot(slot)}
                      scaleTo={0.95}
                      style={[
                        styles.slot,
                        isSelected
                          ? { backgroundColor: colors.brand, borderColor: colors.brand }
                          : { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <ThemedText
                        variant="bodyMedium"
                        numberOfLines={1}
                        color={isSelected ? 'textOnBrand' : 'textPrimary'}
                      >
                        {slot.time_slot_str}
                      </ThemedText>
                      {showCapacity ? (
                        <ThemedText
                          variant="captionSmall"
                          color={isSelected ? 'textOnBrand' : 'textTertiary'}
                        >
                          {t('booking.spotsLeft', { count: slot.capacity_remaining })}
                        </ThemedText>
                      ) : null}
                    </PressableScale>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  groups: { gap: spacing.md },
  group: { gap: spacing.xs },
  grid: { gap: GAP },
  row: { flexDirection: 'row', gap: GAP },
  cell: { flex: 1 },
  pad: { opacity: 0 },
  slot: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
