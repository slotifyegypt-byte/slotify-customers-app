import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { enter, spacing } from '@/theme';

import { LoyaltyCardView } from '../components/LoyaltyCardView';
import { QrCode } from '../components/QrCode';
import { RewardPanel } from '../components/RewardPanel';
import { WalletButtons } from '../components/WalletButtons';
import { useMyLoyaltyCards } from '../hooks/useMyLoyaltyCards';
import { formatCode } from '../lib/card';

export function LoyaltyCardScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const cards = useMyLoyaltyCards();
  const card = cards.data?.find((c) => c.id === id);

  if (!card) {
    return (
      <Screen edges={['top']}>
        <ScreenHeader title={t('loyalty.title')} />
        {cards.isLoading ? null : (
          <EmptyState
            icon="ribbon-outline"
            title={t('loyalty.notFoundTitle')}
            body={t('loyalty.notFoundBody')}
          />
        )}
      </Screen>
    );
  }

  const code = formatCode(card.code);
  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={card.businessName} subtitle={card.programName} />
        <View style={styles.body}>
          <Animated.View entering={enter(0)}>
            <LoyaltyCardView card={card} />
          </Animated.View>

          <Animated.View entering={enter(1)}>
            <Card>
              <View style={styles.qrBlock}>
                <ThemedText variant="h3" style={styles.center}>
                  {t('loyalty.showCode')}
                </ThemedText>
                <QrCode value={card.code} accessibilityLabel={t('loyalty.qrLabel', { code })} />
                <View style={styles.codeBlock}>
                  <ThemedText variant="caption" color="textTertiary">
                    {t('loyalty.codeLabel')}
                  </ThemedText>
                  <ThemedText variant="h2" selectable style={styles.code}>
                    {code}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" color="textSecondary" style={styles.center}>
                  {t('loyalty.showCodeHint')}
                </ThemedText>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={enter(2)} style={{ gap: spacing.xs }}>
            <RewardPanel card={card} />
            {!card.isActive ? (
              <ThemedText variant="caption" color="warning">
                {t('loyalty.paused')}
              </ThemedText>
            ) : null}
          </Animated.View>

          <Animated.View entering={enter(3)}>
            <WalletButtons card={card} />
          </Animated.View>

          <Animated.View entering={enter(4)} style={{ gap: spacing.xxs }}>
            <ThemedText variant="h3">{t('loyalty.howTitle')}</ThemedText>
            <ThemedText variant="body" color="textSecondary">
              {t('loyalty.howBody', { reward: card.rewardTitle })}
            </ThemedText>
            {card.rewardDescription ? (
              <ThemedText variant="caption" color="textTertiary">
                {card.rewardDescription}
              </ThemedText>
            ) : null}
          </Animated.View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  body: { paddingHorizontal: spacing.md, gap: spacing.lg },
  qrBlock: { alignItems: 'center', gap: spacing.md },
  center: { textAlign: 'center' },
  codeBlock: { alignItems: 'center', gap: 2 },
  code: { letterSpacing: 2 },
});
