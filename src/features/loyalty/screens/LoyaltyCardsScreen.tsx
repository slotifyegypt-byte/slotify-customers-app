import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { enter, spacing } from '@/theme';

import type { LoyaltyCard } from '../api/schemas';
import { LoyaltyCardView } from '../components/LoyaltyCardView';
import { useMyLoyaltyCards } from '../hooks/useMyLoyaltyCards';

export function LoyaltyCardsScreen() {
  const { t } = useTranslation();
  const cards = useMyLoyaltyCards();
  const goJoin = () => router.push('/(tabs)/profile/loyalty-join');
  const hasCards = !cards.isLoading && !cards.isError && (cards.data?.length ?? 0) > 0;

  const empty = cards.isLoading ? (
    <View style={{ gap: spacing.md }}>
      <Skeleton height={200} radius={20} />
      <Skeleton height={200} radius={20} />
    </View>
  ) : cards.isError ? (
    <EmptyState
      icon="cloud-offline-outline"
      title={t('loyalty.errorTitle')}
      body={t('loyalty.errorBody')}
      actionLabel={t('common.retry')}
      onAction={() => cards.refetch()}
    />
  ) : (
    <EmptyState
      icon="ribbon-outline"
      title={t('loyalty.emptyTitle')}
      body={t('loyalty.emptyBody')}
      actionLabel={t('loyalty.emptyAction')}
      onAction={goJoin}
    />
  );

  return (
    <Screen edges={['top']}>
      <FlatList<LoyaltyCard>
        data={cards.isLoading || cards.isError ? [] : (cards.data ?? [])}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ScreenHeader
            title={t('loyalty.title')}
            subtitle={t('loyalty.subtitle')}
            right={hasCards ? <Button label={t('loyalty.addCard')} icon="qr-code-outline" variant="secondary" size="sm" fullWidth={false} onPress={goJoin} /> : undefined}
          />}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={enter(index)} style={styles.item}>
            <LoyaltyCardView
              card={item}
              onPress={() => router.push({ pathname: '/(tabs)/profile/loyalty-card', params: { id: item.id } })}
            />
          </Animated.View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xxl, flexGrow: 1 },
  item: { paddingHorizontal: spacing.md },
});
