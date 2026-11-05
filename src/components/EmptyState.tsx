import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useColors } from '@/theme';

import { Button } from './Button';
import { ThemedText } from './ThemedText';

interface EmptyStateProps {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** A glyph in a soft well above the title; says what kind of thing is missing. */
  icon?: ComponentProps<typeof Ionicons>['name'];
}

/** What a screen shows when there is nothing to list: what will appear here, and (when there is one) the way to start. */
export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  icon = 'sparkles-outline',
}: EmptyStateProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={[styles.well, { backgroundColor: colors.brandTint }]}>
        <Ionicons name={icon} size={26} color={colors.brandAccent} />
      </View>
      <ThemedText variant="h3" style={styles.center}>
        {title}
      </ThemedText>
      {body ? (
        <ThemedText variant="body" color="textSecondary" style={[styles.center, styles.body]}>
          {body}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xs,
  },
  well: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  center: { textAlign: 'center' },
  body: { maxWidth: 300 },
  action: { marginTop: spacing.md },
});
