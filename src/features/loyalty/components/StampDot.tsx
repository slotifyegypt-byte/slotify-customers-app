import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  filled: boolean;
  index: number;
  /** Background colour of the card (the tick) and the colour of the circle. */
  color: string;
  ink: string;
  /** Bumps when a new card starts after a reward, so the first stamp pops again. */
  cycle: number;
}

const SIZE = 34;

/** Shrinks the stamp and springs it back, like a stamp landing on the card. */
function pop(scale: SharedValue<number>) {
  scale.value = withSequence(
    withTiming(0.4, { duration: 0 }),
    withSpring(1, { damping: 6, stiffness: 220 }),
  );
}

/** One stamp. Cascades in when the card opens, and pops when it becomes filled while the card is on screen. */
export function StampDot({ filled, index, color, ink, cycle }: Props) {
  const reduce = useReducedMotion();
  const scale = useSharedValue(reduce ? 1 : 0.5);
  const opacity = useSharedValue(reduce ? 1 : 0);
  const wasFilled = useRef(filled);
  const lastCycle = useRef(cycle);
  const mounted = useRef(false);

  // Entrance: each stamp appears a beat after the one before it.
  useEffect(() => {
    if (reduce) return;
    opacity.value = withDelay(index * 55, withTiming(1, { duration: 220 }));
    scale.value = withDelay(index * 55, withSpring(1, { damping: 11, stiffness: 180 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on first show
  }, []);

  // A stamp that fills in front of the customer pops; a new card starting makes its first stamp pop too.
  useEffect(() => {
    const justFilled = filled && !wasFilled.current;
    const newCard = cycle !== lastCycle.current && filled;
    wasFilled.current = filled;
    lastCycle.current = cycle;
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (reduce || !(justFilled || newCard)) return;
    pop(scale);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `scale` is a stable shared value
  }, [filled, cycle, reduce]);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      testID={filled ? 'stamp-filled' : 'stamp-empty'}
      style={[
        styles.stamp,
        filled
          ? { backgroundColor: ink }
          : { borderWidth: 2, borderColor: `${ink}66`, backgroundColor: `${ink}1A` },
        animated,
      ]}
    >
      {filled ? <Ionicons name="checkmark" size={17} color={color} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
