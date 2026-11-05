import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { useColors } from '@/theme';

interface DrawnCheckProps {
  /** Diameter of the disc the tick sits in. */
  size?: number;
  /** Stroke and fill colours; defaults suit the deep-indigo hero surface. */
  disc?: string;
  tick?: string;
}

const SHORT = 13;
const LONG = 26;
const STROKE = 5;

/**
 * A confirmation tick that draws itself: the disc settles in, then the short stroke runs down and the long
 * stroke runs up. With "reduce motion" on it simply appears finished. Built from plain Views (no SVG dependency):
 * an L-shaped box turned 45 degrees, revealed by a growing mask.
 */
export function DrawnCheck({ size = 88, disc, tick }: DrawnCheckProps) {
  const colors = useColors();
  const [pop] = useState(() => new Animated.Value(0));
  const [reveal] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;
    const native = Platform.OS !== 'web';
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduced) => {
        if (cancelled) return;
        if (reduced) {
          pop.setValue(1);
          reveal.setValue(1);
          return;
        }
        Animated.sequence([
          Animated.spring(pop, { toValue: 1, useNativeDriver: native, speed: 14, bounciness: 8 }),
          Animated.timing(reveal, {
            toValue: 1,
            duration: 460,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ]).start();
      });
    return () => {
      cancelled = true;
    };
  }, [pop, reveal]);

  // 0 -> 0.4: the short stroke grows left to right; 0.4 -> 1: the long stroke grows upward.
  const maskWidth = reveal.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, SHORT, SHORT] });
  const maskHeight = reveal.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [STROKE, STROKE, LONG],
  });
  const ink = tick ?? colors.hero;

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.disc,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: disc ?? colors.onHero,
          opacity: pop,
          transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
        },
      ]}
    >
      <View style={styles.tickBox}>
        <Animated.View style={[styles.mask, { width: maskWidth, height: maskHeight }]}>
          <View style={[styles.tick, { borderColor: ink }]} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  disc: { alignItems: 'center', justifyContent: 'center' },
  // The unrotated L is SHORT wide and LONG tall; turned 45 degrees it reads as a tick. The nudge up re-centres it.
  tickBox: {
    width: SHORT,
    height: LONG,
    marginTop: -6,
    transform: [{ rotate: '45deg' }],
  },
  mask: { position: 'absolute', bottom: 0, left: 0, overflow: 'hidden' },
  tick: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SHORT,
    height: LONG,
    borderRightWidth: STROKE,
    borderBottomWidth: STROKE,
    borderBottomRightRadius: 2,
  },
});
