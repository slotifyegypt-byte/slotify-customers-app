import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing } from '@/theme';

import type { LoyaltyCard } from '../api/schemas';
import { inkOn, stampCells, stampColumns } from '../lib/card';

interface Props {
  card: LoyaltyCard;
  onPress?: () => void;
}

/** The loyalty card: the business's own colour, one circle per stamp, the reward at the foot. */
export function LoyaltyCardView({ card, onPress }: Props) {
  const { t } = useTranslation();
  const ink = inkOn(card.brandColor);
  const cells = stampCells(card.stamps, card.stampsRequired);
  const columns = stampColumns(cells.length);
  const label = t('loyalty.cardA11y', { business: card.businessName, have: card.stamps, need: card.stampsRequired });

  const body = (
    <View style={[styles.card, { backgroundColor: card.brandColor }]}>
      <View style={styles.top}>
        <View style={styles.titles}>
          <ThemedText variant="h3" style={{ color: ink }} numberOfLines={1}>
            {card.businessName}
          </ThemedText>
          <ThemedText variant="caption" style={{ color: ink, opacity: 0.8 }} numberOfLines={1}>
            {card.programName}
          </ThemedText>
        </View>
        {card.rewardsAvailable > 0 ? (
          <View style={[styles.badge, { backgroundColor: ink }]}>
            <Ionicons name="gift" size={13} color={card.brandColor} />
            <ThemedText variant="captionStrong" style={{ color: card.brandColor }}>
              {card.rewardsAvailable > 1 ? t('loyalty.rewardsReady', { n: card.rewardsAvailable }) : t('loyalty.rewardReady')}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.grid} importantForAccessibility="no-hide-descendants">
        {cells.map((cell, i) => (
          <View key={i} style={[styles.cell, { width: `${100 / columns}%` }]}>
            <View
              testID={cell === 'filled' ? 'stamp-filled' : 'stamp-empty'}
              style={[
                styles.stamp,
                cell === 'filled' ? { backgroundColor: ink } : { borderWidth: 2, borderColor: ink, opacity: 0.4 },
              ]}
            >
              {cell === 'filled' ? <Ionicons name="checkmark" size={17} color={card.brandColor} /> : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottom}>
        <ThemedText variant="captionStrong" style={{ color: ink }}>
          {t('loyalty.stamps', { have: card.stamps, need: card.stampsRequired })}
        </ThemedText>
        <ThemedText variant="caption" style={{ color: ink, opacity: 0.9, flexShrink: 1 }} numberOfLines={1}>
          {card.rewardTitle}
        </ThemedText>
      </View>
    </View>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={label}>
        {body}
      </View>
    );
  }
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, minHeight: 200, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  titles: { flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.xs + 2, paddingVertical: 4, borderRadius: radius.pill },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.xs },
  cell: { alignItems: 'center' },
  stamp: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm },
});
