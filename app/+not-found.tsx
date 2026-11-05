import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { enter } from '@/theme';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <Screen>
        <Animated.View entering={enter(0)} style={{ flex: 1 }}>
          <EmptyState
            icon="compass-outline"
            title={t('notFound.title')}
            body={t('notFound.body')}
            actionLabel={t('notFound.action')}
            onAction={() => router.replace('/(tabs)/home')}
          />
        </Animated.View>
      </Screen>
    </>
  );
}
