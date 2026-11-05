import { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Divider } from '@/components/Divider';
import { ThemedText } from '@/components/ThemedText';
import { spacing } from '@/theme';

// A row's icon well is 36 wide, with `spacing.md` before it and `spacing.sm` after: dividers start at the text.
const DIVIDER_INSET = spacing.md + 36 + spacing.sm;

interface SettingsGroupProps {
  /** Sentence-case group title in quiet text. */
  title?: string;
  children: ReactNode;
  /** Start the dividers at the row text (rows with an icon well) instead of the card edge. */
  inset?: boolean;
}

/** A labelled group of settings rows: one Card of `ListRow`s separated by hairlines. */
export function SettingsGroup({ title, children, inset = true }: SettingsGroupProps) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.group}>
      {title ? (
        <ThemedText variant="captionStrong" color="textTertiary" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
      <Card padding="none">
        {rows.map((row, index) => (
          <View key={index}>
            {index > 0 ? (
              <Divider style={inset ? { marginStart: DIVIDER_INSET } : undefined} />
            ) : null}
            {row}
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  title: { paddingHorizontal: spacing.xs },
});
