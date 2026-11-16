import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing } from '@/theme';

import type { LoyaltyCard } from '../api/schemas';
import { displayStamps, inkOn, stampCells, stampColumns } from '../lib/card';

import { ConfettiBurst, GlowRing, Shine, useWiggle } from './RewardEffects';
import { StampDot } from './StampDot';

interface Props {
  card: LoyaltyCard;
  onPress?: () => void;
}

/** The loyalty card: the business's own colour, one circle per stamp, the reward at the foot. */
export function LoyaltyCardView({ card, onPress }: Props) {
  const { t } = useTranslation();
  const ink = inkOn(card.brandColor);
  // A reward waiting shows the full card (not an empty one); the next stamp then shows as 1.
  const shown = displayStamps(card);
  const cells = stampCells(shown, card.stampsRequired);
  const columns = stampColumns(cells.length);
  const ready = card.rewardsAvailable > 0;
  const label = t('loyalty.cardA11y', {
    business: card.businessName,
    have: card.stamps,
    need: card.stampsRequired,
  });
  const wiggle = useWiggle();
  const [size, setSize] = useState({ width: 0, height: 0 });

  // A new card starting (the count went down after a reward) makes the first stamp pop; a reward appearing
  // while the card is open throws confetti.
  const lastShown = useRef(shown);
  const lastRewards = useRef(card.rewardsAvailable);
  const [cycle, setCycle] = useState(0);
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    if (shown < lastShown.current) setCycle((c) => c + 1);
    if (card.rewardsAvailable > lastRewards.current) setBurst((b) => b + 1);
    lastShown.current = shown;
    lastRewards.current = card.rewardsAvailable;
  }, [shown, card.rewardsAvailable]);

  const body = (
    <View>
      <View
        style={[styles.card, { backgroundColor: card.brandColor }]}
        onLayout={(e) =>
          setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
        }
      >
        {ready ? <Shine width={size.width} height={size.height} /> : null}
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
              <Animated.View style={wiggle}>
                <Ionicons name="gift" size={13} color={card.brandColor} />
              </Animated.View>
              <ThemedText variant="captionStrong" style={{ color: card.brandColor }}>
                {card.rewardsAvailable > 1
                  ? t('loyalty.rewardsReady', { n: card.rewardsAvailable })
                  : t('loyalty.rewardReady')}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.grid} importantForAccessibility="no-hide-descendants">
          {cells.map((cell, i) => (
            <View key={i} style={[styles.cell, { width: `${100 / columns}%` }]}>
              <StampDot
                filled={cell === 'filled'}
                index={i}
                color={card.brandColor}
                ink={ink}
                cycle={cycle}
              />
            </View>
          ))}
        </View>

        <View style={styles.bottom}>
          <ThemedText variant="captionStrong" style={{ color: ink }}>
            {t('loyalty.stamps', { have: shown, need: card.stampsRequired })}
          </ThemedText>
          <ThemedText
            variant="caption"
            style={{ color: ink, opacity: 0.9, flexShrink: 1 }}
            numberOfLines={1}
          >
            {card.rewardTitle}
          </ThemedText>
        </View>
      </View>
      {ready ? <GlowRing color={card.brandColor} radius={radius.lg + 3} /> : null}
      <ConfettiBurst play={burst} />
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
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    minHeight: 200,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  titles: { flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.xs },
  cell: { alignItems: 'center' },
  bottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
