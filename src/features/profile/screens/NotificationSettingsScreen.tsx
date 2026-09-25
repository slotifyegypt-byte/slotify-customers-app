import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors, type Colors } from '@/theme';

import { useNotificationPreferencesStore } from '../store/notificationPreferencesStore';

// TODO i18n — every label below
const ROWS = [
  { key: 'bookingReminders', label: 'Booking Reminders' },
  { key: 'promotions', label: 'Promotions & Deals' },
  { key: 'orderUpdates', label: 'Order Updates' },
  { key: 'chatMessages', label: 'Chat Messages' },
] as const;

export function NotificationSettingsScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const preferences = useNotificationPreferencesStore();

  return (
    <Screen>
      <ScreenHeader title="Notification Settings" />
      <ScrollView contentContainerStyle={styles.padded}>
        <View style={styles.section}>
          {ROWS.map((row, index) => (
            <View key={row.key} style={[styles.row, index === ROWS.length - 1 && styles.rowLast]}>
              <ThemedText variant="bodyMedium" style={styles.rowLabel}>
                {row.label}
              </ThemedText>
              <Switch
                value={preferences[row.key]}
                onValueChange={(value) => preferences.setPreference(row.key, value)}
                trackColor={{ false: colors.border, true: colors.brandAccent }}
                thumbColor={colors.surface}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    padded: { padding: spacing.lg, paddingBottom: spacing.xxl },
    title: { marginBottom: spacing.lg },
    section: {
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.divider,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    rowLast: { borderBottomWidth: 0 },
    rowLabel: { flex: 1 },
  });
