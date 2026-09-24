import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { ThemedText } from './ThemedText';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <ThemedText variant="h3" numberOfLines={1} style={styles.title}>
        {title}
      </ThemedText>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} style={styles.seeAll}>
          <ThemedText variant="bodyMedium" color="accentSecondary">
            {t('common.seeAll')}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  // Title can genuinely overflow the row at larger accessibility text-size
  // settings once "See all" is competing for the same line — shrink and
  // ellipsize it instead of hard-clipping mid-word with no indicator.
  title: { flexShrink: 1, marginRight: spacing.sm },
  seeAll: { flexShrink: 0 },
});
