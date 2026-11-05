import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { PressableScale } from '@/components/PressableScale';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors } from '@/theme';

import { useStoreEmployeesForService } from '../hooks/useStoreServices';

interface SpecialistPickerProps {
  storeId: string;
  serviceId: string;
  /** null = "Any professional": resolved to a concrete employee_id once a slot is picked. */
  selectedEmployeeId: string | null;
  onSelect: (employeeId: string | null) => void;
  /** Lets the row run to the screen edge: pass the screen's side margin. */
  bleed?: number;
}

// customer-app-api-map.md §0.1: specialist-mode services let the customer pick
// a specific employee, or "Any professional" resolved to a specific employee
// client-side before submitting (here: whichever slot they end up tapping).
//
// "Any professional" is a distinct first option (people icon, no photo), then
// real staff as round avatar + first name (+ rating when the backend has one).
// The chosen one gets a brand edge, a soft fill and a check.
export function SpecialistPicker({
  storeId,
  serviceId,
  selectedEmployeeId,
  onSelect,
  bleed = 0,
}: SpecialistPickerProps) {
  const colors = useColors();
  const employees = useStoreEmployeesForService(storeId, serviceId);
  const edge = bleed ? { marginHorizontal: -bleed } : null;
  const pad = bleed ? { paddingHorizontal: bleed } : null;

  if (employees.isLoading) {
    return (
      <View style={[styles.row, styles.rowStatic]}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width={92} height={112} radius={radius.lg} />
        ))}
      </View>
    );
  }

  if (employees.isError) {
    return (
      <View style={styles.error}>
        <ThemedText variant="body" color="textSecondary">
          {/* TODO i18n */}
          Couldn&apos;t load the team for this service.
        </ThemedText>
        <Button
          label="Try again" /* TODO i18n */
          variant="secondary"
          size="sm"
          fullWidth={false}
          onPress={() => employees.refetch()}
        />
      </View>
    );
  }

  const cells = [
    { id: null as string | null, name: 'Anyone' /* TODO i18n */, member: null },
    ...(employees.data ?? []).map((employee) => ({
      id: employee.id as string | null,
      name: employee.first_name,
      member: employee,
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, edge]}
      contentContainerStyle={[styles.row, pad]}
    >
      {cells.map(({ id, name, member }) => {
        const isSelected = selectedEmployeeId === id;
        return (
          <PressableScale
            key={id ?? 'any'}
            accessibilityRole="button"
            accessibilityLabel={member ? name : 'Any professional' /* TODO i18n */}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(id)}
            scaleTo={0.96}
            style={[
              styles.cell,
              isSelected
                ? {
                    backgroundColor: colors.brandTint,
                    borderColor: colors.brand,
                    borderWidth: 1.5,
                  }
                : {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: StyleSheet.hairlineWidth * 2,
                  },
            ]}
          >
            {member ? (
              <Avatar
                uri={member.profile_picture}
                label={member.first_name.charAt(0).toUpperCase()}
                size={52}
              />
            ) : (
              <View style={[styles.anyWell, { backgroundColor: colors.brandTint }]}>
                <Ionicons name="people-outline" size={24} color={colors.brandAccent} />
              </View>
            )}
            <ThemedText variant="captionStrong" numberOfLines={2} style={styles.name}>
              {name}
            </ThemedText>
            {member && typeof member.rating === 'number' ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={11} color={colors.ratingStar} />
                <ThemedText variant="captionSmall" color="textSecondary">
                  {member.rating % 1 === 0 ? member.rating.toFixed(0) : member.rating.toFixed(1)}
                </ThemedText>
              </View>
            ) : null}
            {isSelected ? (
              <View style={[styles.check, { backgroundColor: colors.brand }]}>
                <Ionicons name="checkmark" size={12} color={colors.textOnBrand} />
              </View>
            ) : null}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { paddingVertical: spacing.xxs, gap: spacing.xs },
  rowStatic: { flexDirection: 'row' },
  cell: {
    width: 92,
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
  },
  anyWell: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  check: {
    position: 'absolute',
    top: 6,
    end: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { gap: spacing.sm, alignItems: 'flex-start' },
});
