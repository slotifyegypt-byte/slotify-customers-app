import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Switch } from 'react-native';
import Animated from 'react-native-reanimated';

import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { enter, spacing, useColors } from '@/theme';

import { SettingsGroup } from '../components/SettingsGroup';
import { useNotificationPreferencesStore } from '../store/notificationPreferencesStore';

type PreferenceKey = 'bookingReminders' | 'promotions' | 'orderUpdates' | 'chatMessages';

interface Row {
  key: PreferenceKey;
  icon: 'alarm-outline' | 'receipt-outline' | 'chatbubble-ellipses-outline' | 'pricetag-outline';
  tone: 'brand' | 'success' | 'warning';
}

const GROUPS: { titleKey: string; rows: Row[] }[] = [
  {
    titleKey: 'notificationSettings.groupBookings',
    rows: [
      { key: 'bookingReminders', icon: 'alarm-outline', tone: 'brand' },
      { key: 'orderUpdates', icon: 'receipt-outline', tone: 'success' },
    ],
  },
  {
    titleKey: 'notificationSettings.groupMessages',
    rows: [
      { key: 'chatMessages', icon: 'chatbubble-ellipses-outline', tone: 'brand' },
      { key: 'promotions', icon: 'pricetag-outline', tone: 'warning' },
    ],
  },
];

export function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const preferences = useNotificationPreferencesStore();

  return (
    <Screen>
      <ScreenHeader title={t('notificationSettings.title')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {GROUPS.map((group, index) => (
          <Animated.View key={group.titleKey} entering={enter(index)}>
            <SettingsGroup title={t(group.titleKey)}>
              {group.rows.map((row) => (
                <ListRow
                  key={row.key}
                  title={t(`notificationSettings.${row.key}`)}
                  icon={row.icon}
                  iconTone={row.tone}
                  trailing={
                    <Switch
                      value={preferences[row.key]}
                      onValueChange={(value) => preferences.setPreference(row.key, value)}
                      accessibilityLabel={t(`notificationSettings.${row.key}`)}
                      trackColor={{ false: colors.disabled, true: colors.brandAccent }}
                      thumbColor={colors.onHero}
                      // react-native-web paints the on-state thumb with its own prop; native ignores it.
                      {...({ activeThumbColor: colors.onHero } as object)}
                    />
                  }
                />
              ))}
            </SettingsGroup>
          </Animated.View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: 120,
    gap: 28,
  },
});
