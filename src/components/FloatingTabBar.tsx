import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { useEffect, useState, type ComponentProps } from 'react';
import {
  AccessibilityInfo,
  Animated,
  I18nManager,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily, radius, shadows, useColors, useTheme } from '@/theme';

import { PressableScale } from './PressableScale';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const BAR_HEIGHT = 64;
const INSET = 6;
const SPRING = { stiffness: 230, damping: 19, mass: 0.9 } as const;

/**
 * The bottom tab bar: a floating pill. On iOS 26 it is real liquid glass; elsewhere a solid surface with a
 * hairline and a soft shadow. The highlight behind the active tab is a liquid drop: it springs to the tapped
 * tab and stretches while it travels. It stays in the layout flow, so sheets and sticky action bars above it
 * keep their place.
 */
export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const colors = useColors();
  const { scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [pillWidth, setPillWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [position] = useState(() => new Animated.Value(state.index));

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => {
        if (!cancelled) setReduceMotion(on);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      position.setValue(state.index);
      return;
    }
    Animated.spring(position, {
      toValue: state.index,
      useNativeDriver: Platform.OS !== 'web',
      ...SPRING,
    }).start();
  }, [position, state.index, reduceMotion]);

  const count = state.routes.length;
  const tabWidth = pillWidth > 0 ? (pillWidth - INSET * 2) / count : 0;
  const lastIndex = count - 1;
  const travel = position.interpolate({
    inputRange: [0, lastIndex],
    outputRange: [0, (I18nManager.isRTL ? -1 : 1) * lastIndex * tabWidth],
  });
  // Halfway between two tabs the drop is at its widest, then it settles back to a round tab.
  const stretch = position.interpolate({
    inputRange: Array.from({ length: count * 2 - 1 }, (_, i) => i / 2),
    outputRange: Array.from({ length: count * 2 - 1 }, (_, i) => (i % 2 === 0 ? 1 : 1.22)),
  });

  const glass = Platform.OS === 'ios' && isLiquidGlassAvailable();
  const pillStyle = [
    styles.pill,
    !glass && {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth * 2,
      ...shadows.lg,
    },
  ];
  const Pill = glass ? GlassView : View;
  const pillProps = glass
    ? ({ glassEffectStyle: 'regular', colorScheme: scheme, isInteractive: true } as const)
    : {};

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      <Pill
        {...pillProps}
        style={pillStyle}
        onLayout={(e) => setPillWidth(e.nativeEvent.layout.width)}
      >
        {tabWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.drop,
              {
                width: tabWidth,
                backgroundColor: colors.brandTintStrong,
                transform: [{ translateX: travel }, { scaleX: stretch }],
              },
            ]}
          />
        ) : null}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]!;
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const tint = focused ? colors.tabActive : colors.tabInactive;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              scaleTo={0.92}
              style={styles.tab}
            >
              {options.tabBarIcon?.({ focused, color: tint, size: 24 })}
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color: tint,
                    fontFamily: focused ? fontFamily.headingBold : fontFamily.bodySemiBold,
                  },
                ]}
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </Pill>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 8 },
  pill: {
    height: BAR_HEIGHT,
    borderRadius: radius.pill,
    flexDirection: 'row',
    padding: INSET,
  },
  drop: {
    position: 'absolute',
    top: INSET,
    bottom: INSET,
    start: INSET,
    borderRadius: radius.pill,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: 11 },
});
