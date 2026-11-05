import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useColors } from '@/theme';

import { Pill } from './Pill';
import { ThemedText } from './ThemedText';

interface ComingSoonProps {
  /** What's not built yet, e.g. "Live Queue" — shown as the heading. */
  feature: string;
  /** Optional one-line reason, e.g. "No backend support yet for onsite dispatch." */
  note?: string;
  compact?: boolean;
}

/**
 * Shared placeholder for design screens/sections that have no backend support yet. Keeps the layout intact
 * without faking functionality that doesn't exist: a quiet card that says what is coming.
 */
export function ComingSoon({ feature, note, compact }: ComingSoonProps) {
  const { t } = useTranslation();
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        compact && styles.compact,
        { backgroundColor: colors.backgroundMuted },
      ]}
    >
      <View style={[styles.well, { backgroundColor: colors.brandTint }]}>
        <Ionicons name="time-outline" size={20} color={colors.brandAccent} />
      </View>
      <Pill label={t('common.comingSoon')} tone="brand" />
      <ThemedText variant="h3" style={[styles.center, styles.feature]}>
        {feature}
      </ThemedText>
      {note ? (
        <ThemedText variant="caption" color="textTertiary" style={styles.center}>
          {note}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xxs,
    borderRadius: radius.lg,
  },
  compact: { padding: spacing.md },
  well: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  center: { textAlign: 'center' },
  feature: { marginTop: spacing.xs },
});
