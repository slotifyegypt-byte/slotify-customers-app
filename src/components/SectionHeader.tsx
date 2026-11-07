import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { spacing, useColors } from '@/theme';

import { PressableScale } from './PressableScale';
import { ThemedText } from './ThemedText';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

/** A section's title, with a quiet "See all" on the right when there is more to see. */
export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <View style={styles.row}>
      <ThemedText variant="h2" numberOfLines={1} style={styles.title}>
        {title}
      </ThemedText>
      {onSeeAll ? (
        <PressableScale
          onPress={onSeeAll}
          accessibilityRole="button"
          hitSlop={8}
          scaleTo={0.96}
          style={styles.seeAll}
        >
          <ThemedText variant="bodyMedium" color="brandAccent">
            {t('common.seeAll')}
          </ThemedText>
          <Ionicons name="chevron-forward" size={15} color={colors.brandAccent} />
        </PressableScale>
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
  title: { flex: 1 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2, marginStart: spacing.sm },
});
