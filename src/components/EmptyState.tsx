import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { Button } from './Button';
import { ThemedText } from './ThemedText';

interface EmptyStateProps {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
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
  },
  center: { textAlign: 'center' },
  body: { marginTop: spacing.xs },
  action: { marginTop: spacing.lg },
});
