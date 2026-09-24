import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { ThemedText } from './ThemedText';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Optional trailing content (e.g. Notifications' "Mark all as read" link). */
  right?: ReactNode;
}

/**
 * The back-button + title header used throughout the app (Explore, Venue,
 * Notifications, Chat, the booking flow, and every Profile subpage) —
 * circular light-purple-tinted back button, brand-purple bold title. A
 * shared component so this doesn't get re-implemented slightly differently
 * screen by screen.
 */
export function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack ?? (() => router.back())} style={styles.backButton} hitSlop={8}>
        <Ionicons name="chevron-back" size={18} color={colors.brand} />
      </Pressable>
      <View style={styles.textCol}>
        <ThemedText variant="h2" color="brand" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
});
