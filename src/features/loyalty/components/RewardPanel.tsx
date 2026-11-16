import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors } from '@/theme';

import type { LoyaltyCard } from '../api/schemas';
import { displayStamps, inkOn } from '../lib/card';

import { useWiggle } from './RewardEffects';

/**
 * What the customer is collecting for, in the card's own colour: the reward, how many are ready to claim and how many
 * were claimed. A ready reward gets a celebration banner that springs in.
 */
export function RewardPanel({ card }: { card: LoyaltyCard }) {
  const { t } = useTranslation();
  const colors = useColors();
  const reduce = useReducedMotion();
  const ready = card.rewardsAvailable > 0;
  const ink = inkOn(card.brandColor);
  const wiggle = useWiggle();
  const pop = useSharedValue(reduce ? 1 : 0.85);
  useEffect(() => {
    if (!reduce && ready) pop.value = withDelay(250, withSpring(1, { damping: 8, stiffness: 160 }));
  }, [ready, reduce, pop]);
  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
    opacity: reduce ? 1 : 0.2 + pop.value * 0.8,
  }));
  const left = Math.max(0, card.stampsRequired - displayStamps(card));

  return (
    <View style={{ gap: spacing.sm }}>
      {ready ? (
        <Animated.View
          style={[styles.banner, { backgroundColor: card.brandColor }, popStyle]}
          accessible
          accessibilityRole="summary"
        >
          <Animated.View style={[styles.gift, { backgroundColor: ink }, wiggle]}>
            <Ionicons name="gift" size={26} color={card.brandColor} />
          </Animated.View>
          <View style={styles.bannerText}>
            <ThemedText variant="captionStrong" style={{ color: ink, opacity: 0.85 }}>
              {card.rewardsAvailable > 1
                ? t('loyalty.rewardsReady', { n: card.rewardsAvailable })
                : t('loyalty.rewardReady')}
            </ThemedText>
            <ThemedText variant="h2" style={{ color: ink }} numberOfLines={2}>
              {card.rewardTitle}
            </ThemedText>
            <ThemedText variant="caption" style={{ color: ink, opacity: 0.9 }}>
              {t('loyalty.claimHint')}
            </ThemedText>
          </View>
        </Animated.View>
      ) : (
        <ThemedText variant="bodyMedium">
          {t('loyalty.collect', { need: left, reward: card.rewardTitle })}
        </ThemedText>
      )}

      <View style={[styles.facts, { borderColor: colors.border }]}>
        <Fact label={t('loyalty.factReward')} value={card.rewardTitle} wide />
        <Fact label={t('loyalty.factReady')} value={String(card.rewardsAvailable)} strong={ready} />
        <Fact label={t('loyalty.factClaimed')} value={String(card.rewardsRedeemed)} />
      </View>
    </View>
  );
}

function Fact({
  label,
  value,
  wide,
  strong,
}: {
  label: string;
  value: string;
  wide?: boolean;
  strong?: boolean;
}) {
  return (
    <View style={[styles.fact, wide && { flex: 2 }]}>
      <ThemedText variant="caption" color="textTertiary" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText
        variant={strong ? 'h3' : 'bodyMedium'}
        color={strong ? 'brand' : 'textPrimary'}
        numberOfLines={2}
      >
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  gift: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  bannerText: { flex: 1, gap: 2 },
  facts: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fact: { flex: 1, gap: 2 },
  label: { textTransform: 'uppercase', letterSpacing: 0.6 },
});
