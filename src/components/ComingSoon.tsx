import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useColors, type Colors } from '@/theme';

import { ThemedText } from './ThemedText';

interface ComingSoonProps {
  /** What's not built yet, e.g. "Live Queue" — shown as the heading. */
  feature: string;
  /** Optional one-line reason, e.g. "No backend support yet for onsite dispatch." */
  note?: string;
  compact?: boolean;
}

/**
 * Shared placeholder for design screens/sections that have no backend
 * support yet (Live Queue, Onsite dispatch, Ticket Tracker, quote-pending,
 * phone/Apple sign-in — see customer-app-api-map.md §0.3/§14). Keeps the
 * design's layout intact without faking functionality that doesn't exist.
 */
export function ComingSoon({ feature, note, compact }: ComingSoonProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <ThemedText variant="h3" style={styles.center}>
        {t('common.comingSoon')}
      </ThemedText>
      <ThemedText variant="body" color="textSecondary" style={[styles.center, styles.spaced]}>
        {feature}
      </ThemedText>
      {note ? (
        <ThemedText variant="caption" color="textSecondary" style={[styles.center, styles.spaced]}>
          {note}
        </ThemedText>
      ) : null}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      backgroundColor: colors.backgroundMuted,
      borderRadius: radius.lg,
    },
    compact: { padding: spacing.md },
    center: { textAlign: 'center' },
    spaced: { marginTop: spacing.xxs },
  });
