import { Tabs } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';

import { FloatingTabBar } from '@/components/FloatingTabBar';
import { useColors } from '@/theme';

function makeTabIcon(outline: SymbolViewProps['name'], filled: SymbolViewProps['name']) {
  function TabIcon({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) {
    return <SymbolView name={focused ? filled : outline} tintColor={color} size={size} />;
  }
  return TabIcon;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const colors = useColors();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('nav.home'),
          tabBarIcon: makeTabIcon(
            { ios: 'house', android: 'home', web: 'home' },
            { ios: 'house.fill', android: 'home', web: 'home' },
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('nav.explore'),
          tabBarIcon: makeTabIcon(
            { ios: 'safari', android: 'explore', web: 'explore' },
            { ios: 'safari.fill', android: 'explore', web: 'explore' },
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: t('nav.activity'),
          tabBarIcon: makeTabIcon(
            { ios: 'checklist', android: 'event', web: 'event' },
            { ios: 'checklist', android: 'event', web: 'event' },
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: makeTabIcon(
            { ios: 'person', android: 'person', web: 'person' },
            { ios: 'person.fill', android: 'person', web: 'person' },
          ),
        }}
      />
    </Tabs>
  );
}
