import { Modal, StyleSheet, View } from 'react-native';

import { radius, spacing, useColors, type Colors } from '@/theme';

import { Button } from './Button';
import { ThemedText } from './ThemedText';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body?: string;
  /** Rendered first/on top — the safe action (e.g. "Cancel"), filled accent. */
  primaryLabel: string;
  onPrimary: () => void;
  /** Rendered second/below — the destructive action (e.g. "Log Out"), outlined. */
  secondaryLabel: string;
  onSecondary: () => void;
  secondaryLoading?: boolean;
  onRequestClose?: () => void;
}

/**
 * Centered dimmed-overlay confirmation dialog matching the design's
 * inverted safe-first/destructive-second button order (e.g. logging out —
 * see Slotify Onboarding shot 20): the filled purple button is always the
 * safe choice and comes first, the outlined button is the destructive one
 * and comes second. Reuse this anywhere a destructive action needs a custom
 * confirm instead of the bare OS `Alert`.
 */
export function ConfirmDialog({
  visible,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  secondaryLoading,
  onRequestClose,
}: ConfirmDialogProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose ?? onPrimary}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ThemedText variant="h2" style={styles.title}>
            {title}
          </ThemedText>
          {body ? (
            <ThemedText variant="body" color="textSecondary" style={styles.body}>
              {body}
            </ThemedText>
          ) : null}
          <Button label={primaryLabel} variant="accent" onPress={onPrimary} style={styles.primaryButton} />
          <Button
            label={secondaryLabel}
            variant="ghost"
            loading={secondaryLoading}
            onPress={onSecondary}
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.overlay,
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
    },
    title: { textAlign: 'center' },
    body: { textAlign: 'center', marginTop: spacing.xs },
    primaryButton: { marginTop: spacing.lg },
    secondaryButton: { marginTop: spacing.sm },
  });
