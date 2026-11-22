import { useTranslation } from 'react-i18next';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import { enter, radius, spacing } from '@/theme';

import type { Block } from '../api/safetyApi';
import { useBlockActions, useMyBlocks } from '../hooks/useBlocks';

/** Profile → Blocked: the businesses and reviewers this customer blocked, each with Unblock. */
export function BlockedScreen() {
  const { t } = useTranslation();
  const blocks = useMyBlocks();
  const { unblock } = useBlockActions();

  const empty = blocks.isLoading ? (
    <View style={styles.list}>
      <Skeleton height={72} radius={radius.lg} />
      <Skeleton height={72} radius={radius.lg} />
    </View>
  ) : blocks.isError ? (
    <EmptyState
      icon="cloud-offline-outline"
      title={t('safety.errorTitle')}
      body={t('safety.errorBody')}
      actionLabel={t('common.retry')}
      onAction={() => blocks.refetch()}
    />
  ) : (
    <EmptyState icon="ban-outline" title={t('safety.emptyTitle')} body={t('safety.emptyBody')} />
  );

  return (
    <Screen>
      <ScreenHeader title={t('safety.blockedTitle')} subtitle={t('safety.blockedSubtitle')} />
      <FlatList<Block>
        data={blocks.data ?? []}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={empty}
        renderItem={({ item, index }) => (
          <Animated.View entering={enter(index)}>
            <Card>
              <View style={styles.row}>
                <Avatar label={item.name.charAt(0).toUpperCase()} size={40} />
                <View style={styles.who}>
                  <ThemedText variant="bodyMedium" numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <ThemedText variant="caption" color="textTertiary">
                    {item.kind === 'business' ? t('safety.kindBusiness') : t('safety.kindPerson')}
                  </ThemedText>
                </View>
                <Button
                  label={t('safety.unblock')}
                  variant="secondary"
                  fullWidth={false}
                  loading={unblock.isPending && unblock.variables === item.id}
                  accessibilityLabel={`${t('safety.unblock')} ${item.name}`}
                  onPress={() =>
                    unblock.mutate(item.id, {
                      onError: () => Alert.alert(t('safety.failedTitle'), t('safety.failedBody')),
                    })
                  }
                />
              </View>
            </Card>
          </Animated.View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    flexGrow: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  who: { flex: 1, minWidth: 0 },
});
