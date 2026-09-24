import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { colors, radius, spacing } from '@/theme';

import { useStoreEmployeesForService } from '../hooks/useStoreServices';

interface SpecialistPickerProps {
  storeId: string;
  serviceId: string;
  /** null = "Any specialist" — resolved to a concrete employee_id once a slot is picked. */
  selectedEmployeeId: string | null;
  onSelect: (employeeId: string | null) => void;
}

// Pastel avatar-fill palette for employees without a profile photo — picked
// deterministically from the name so a given specialist always gets the same
// color, matching the mockups' per-avatar tint variety (Design ref
// 24-booking-configure.png: purple avatar for "Yara", pink for "Hana").
const AVATAR_PALETTE = [
  { bg: colors.brandTint, fg: colors.brandAccent },
  { bg: 'rgba(226, 74, 74, 0.14)', fg: colors.danger },
  { bg: colors.successTint, fg: colors.success },
  { bg: 'rgba(224, 167, 45, 0.16)', fg: colors.warning },
  { bg: 'rgba(0, 159, 208, 0.14)', fg: colors.accentSecondary },
] as const;

function avatarPaletteFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

// customer-app-api-map.md §0.1: specialist-mode services let the customer pick
// a specific employee, or "Anyone available" resolved to a specific employee
// client-side before submitting (here: whichever slot they end up tapping).
//
// Design ref 24-booking-configure.png: "Any Professional" is a distinct first
// option (checkmark icon, no photo), then real staff as circular avatar +
// name + star rating. The selected item gets a rounded-rect purple border
// around the whole cell — not a filled background swap like a plain chip.
export function SpecialistPicker({ storeId, serviceId, selectedEmployeeId, onSelect }: SpecialistPickerProps) {
  const employees = useStoreEmployeesForService(storeId, serviceId);

  if (employees.isLoading) {
    return <ActivityIndicator style={styles.spinner} color={colors.brand} />;
  }

  if (employees.isError) {
    return (
      <ThemedText variant="caption" color="danger">
        {/* TODO i18n */}
        Couldn&apos;t load specialists for this service.
      </ThemedText>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: selectedEmployeeId === null }}
        onPress={() => onSelect(null)}
        style={[styles.cell, selectedEmployeeId === null && styles.cellSelected]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.brandTint }]}>
          <Ionicons name="checkmark" size={22} color={colors.brandAccent} />
        </View>
        <ThemedText variant="caption" numberOfLines={1} style={styles.name}>
          {/* TODO i18n */}
          Any Professional
        </ThemedText>
      </Pressable>
      {employees.data?.map((employee) => {
        const isSelected = selectedEmployeeId === employee.id;
        const name = [employee.first_name, employee.last_name].filter(Boolean).join(' ');
        const initial = employee.first_name.charAt(0).toUpperCase();
        const palette = avatarPaletteFor(employee.id || name);
        return (
          <Pressable
            key={employee.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(employee.id)}
            style={[styles.cell, isSelected && styles.cellSelected]}
          >
            {employee.profile_picture ? (
              <Image source={{ uri: employee.profile_picture }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, { backgroundColor: palette.bg }]}>
                <ThemedText variant="bodyMedium" style={{ color: palette.fg }}>
                  {initial}
                </ThemedText>
              </View>
            )}
            <ThemedText variant="caption" numberOfLines={1} style={styles.name}>
              {employee.first_name}
            </ThemedText>
            {typeof employee.rating === 'number' ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={10} color={colors.ratingStar} />
                <ThemedText variant="captionSmall" color="textSecondary">
                  {employee.rating % 1 === 0 ? employee.rating.toFixed(0) : employee.rating.toFixed(1)}
                </ThemedText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  spinner: { marginVertical: spacing.md },
  row: { paddingVertical: spacing.xs },
  cell: {
    alignItems: 'center',
    width: 78,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xxs,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginRight: spacing.xs,
  },
  cellSelected: { borderColor: colors.brandAccent },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
    overflow: 'hidden',
  },
  name: { textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
});
