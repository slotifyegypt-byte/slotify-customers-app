import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

import { colors } from '@/theme';
import type { MainTabParamList } from './types';

import HomeStack    from './stacks/HomeStack';
import ExploreStack from './stacks/ExploreStack';
import ActivityStack from './stacks/ActivityStack';
import ProfileStack from './stacks/ProfileStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

// ── Inline tab icons (SVG paths lifted directly from Bottom Nav.dc.html) ──────

function HomeIcon({ color, focused }: { color: string; focused: boolean }) {
  return focused ? (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11L12 4L20 11V20A1 1 0 0119 21H5A1 1 0 014 20V11Z"
        fill={color}
      />
      <Rect x={10} y={14.5} width={4} height={6.5} rx={1} fill="#FFFFFF" />
    </Svg>
  ) : (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11L12 4L20 11V20A1 1 0 0119 21H5A1 1 0 014 20V11Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ExploreIcon({ color, focused }: { color: string; focused: boolean }) {
  return focused ? (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} fill={color} />
      <Path d="M15 9L13 13L9 15L11 11L15 9Z" fill="#FFFFFF" />
    </Svg>
  ) : (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.7} />
      <Path d="M15 9L13 13L9 15L11 11L15 9Z" stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
    </Svg>
  );
}

function ActivityIcon({ color, focused }: { color: string; focused: boolean }) {
  return focused ? (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={4} width={16} height={16} rx={4} fill={color} />
      <Path d="M8 12l2.5 2.5L16 9" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ) : (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Line x1={6}  y1={7}  x2={18} y2={7}  stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Line x1={6}  y1={12} x2={18} y2={12} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Line x1={6}  y1={17} x2={14} y2={17} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

function ProfileIcon({ color, focused }: { color: string; focused: boolean }) {
  return focused ? (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={7} r={3.5} fill={color} />
      <Path d="M12 12c-4 0-7 2.5-7 6v2h14v-2c0-3.5-3-6-7-6z" fill={color} />
    </Svg>
  ) : (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={1.7} />
      <Path d="M5 20c0-4 3-6 7-6s7 2 7 6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          // Extra padding so content clears the home indicator on modern iPhones.
          // SafeAreaView inside each screen handles the rest.
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'PlusJakartaSans-Medium',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <HomeIcon color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => <ExploreIcon color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ActivityTab"
        component={ActivityStack}
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => <ActivityIcon color={color} focused={focused} />,
          // Badge count wired up in Phase 2 when we add React Query for active bookings.
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => <ProfileIcon color={color} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
