import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { IconButton } from './IconButton';
import { ThemedText } from './ThemedText';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Optional trailing content (e.g. Notifications' "Mark all as read" link). */
  right?: ReactNode;
}

/**
 * The back-button + title header used throughout the app (Explore, Venue, Notifications, Chat, the booking flow
 * and every Profile subpage): a round back button, a plain title, an optional quieter line beneath it. One
 * shared component so it never drifts screen by screen.
 */
export function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <IconButton
        icon="chevron-back"
        accessibilityLabel="Back"
        onPress={onBack ?? (() => router.back())}
      />
      <View style={styles.textCol}>
        <ThemedText variant="h2" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText variant="caption" color="textTertiary" numberOfLines={1}>
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
  textCol: { flex: 1, minWidth: 0 },
});
