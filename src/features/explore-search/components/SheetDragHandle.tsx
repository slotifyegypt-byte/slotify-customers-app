import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { radius, spacing, useColors } from '@/theme';

// Drag distance (px) past which the sheet handle's pan gesture commits to
// expanding/collapsing, instead of springing back to rest.
const DRAG_TRIGGER_DISTANCE = 28;

// Drag the sheet's grip handle to expand/collapse (in addition to tapping
// it) — a Race between Pan and Tap so a plain tap still resolves instantly
// while a real drag past DRAG_TRIGGER_DISTANCE commits to the transition.
export function SheetDragHandle({
  onExpand,
  onCollapse,
  accessibilityLabel,
}: {
  onExpand?: () => void;
  onCollapse?: () => void;
  accessibilityLabel?: string;
}) {
  const colors = useColors();
  // Callers always pass exactly one of the two; the no-op fallback only
  // guards against a hook-order violation if that were ever not the case.
  const trigger = onExpand ?? onCollapse ?? (() => {});
  const expanding = Boolean(onExpand);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .minDistance(6)
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const committed = expanding
        ? e.translationY < -DRAG_TRIGGER_DISTANCE
        : e.translationY > DRAG_TRIGGER_DISTANCE;
      if (committed) runOnJS(trigger)();
      translateY.value = withSpring(0, { damping: 18 });
    });

  const tap = Gesture.Tap().onEnd(() => runOnJS(trigger)());

  const composed = Gesture.Race(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value * 0.35 }],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[styles.wrap, animatedStyle]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: spacing.xs + 2, paddingBottom: spacing.sm, alignItems: 'center' },
  handle: { width: 40, height: 5, borderRadius: radius.pill },
});
