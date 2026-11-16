import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/** A soft ring that breathes around a card with a reward waiting. */
export function GlowRing({ color, radius }: { color: string; radius: number }) {
  const reduce = useReducedMotion();
  const pulse = useSharedValue(reduce ? 0.5 : 0.15);
  useEffect(() => {
    if (reduce) return;
    pulse.value = withRepeat(
      withTiming(0.7, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [reduce, pulse]);
  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 1 + pulse.value * 0.012 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      style={[styles.ring, { borderColor: color, borderRadius: radius }, style]}
    />
  );
}

/** A diagonal band of light that sweeps across the card every few seconds. Clipped by the card. */
export function Shine({ width, height }: { width: number; height: number }) {
  const reduce = useReducedMotion();
  const x = useSharedValue(-120);
  useEffect(() => {
    if (reduce || width === 0) return;
    x.value = -120;
    x.value = withRepeat(
      withSequence(
        withDelay(
          900,
          withTiming(width + 120, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        ),
        withTiming(-120, { duration: 0 }),
      ),
      -1,
    );
    return () => cancelAnimation(x);
  }, [reduce, width, x]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: '18deg' }],
  }));
  if (reduce) return null;
  return (
    <Animated.View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      style={[styles.shine, { height: height * 1.6, top: -height * 0.3 }, style]}
    />
  );
}

const PARTICLES = 14;
const COLORS = ['#FFC83D', '#FF6B8B', '#5BD6A5', '#7AB8FF', '#FFFFFF'];

function Particle({
  i,
  progress,
  spread,
}: {
  i: number;
  progress: { value: number };
  spread: number;
}) {
  const angle = (i / PARTICLES) * Math.PI * 2 + (i % 2 ? 0.25 : 0);
  const dist = spread * (0.55 + ((i * 37) % 10) / 22);
  const size = 6 + (i % 3) * 2;
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p === 0 ? 0 : 1 - p,
      transform: [
        { translateX: Math.cos(angle) * dist * p },
        { translateY: Math.sin(angle) * dist * p + 18 * p * p },
        { scale: 1 - p * 0.4 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: i % 2 ? size / 2 : 1.5,
          backgroundColor: COLORS[i % COLORS.length],
        },
        style,
      ]}
    />
  );
}

/** A burst of confetti from the middle of its box. `play` changes to replay it; nothing shows while idle or with reduced motion. */
export function ConfettiBurst({ play, spread = 120 }: { play: number; spread?: number }) {
  const reduce = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    if (reduce || play === 0) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) });
  }, [play, reduce, progress]);
  return (
    <View pointerEvents="none" importantForAccessibility="no-hide-descendants" style={styles.burst}>
      {Array.from({ length: PARTICLES }, (_, i) => (
        <Particle key={i} i={i} progress={progress} spread={spread} />
      ))}
    </View>
  );
}

/** A gift that wiggles now and then to say "this is for you". */
export function useWiggle() {
  const reduce = useReducedMotion();
  const turn = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    turn.value = withRepeat(
      withSequence(
        withDelay(1400, withTiming(-14, { duration: 90 })),
        withTiming(14, { duration: 130 }),
        withTiming(-10, { duration: 120 }),
        withTiming(8, { duration: 110 }),
        withTiming(0, { duration: 100 }),
      ),
      -1,
    );
    return () => cancelAnimation(turn);
  }, [reduce, turn]);
  return useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', top: -3, left: -3, right: -3, bottom: -3, borderWidth: 2 },
  shine: { position: 'absolute', left: 0, width: 56, backgroundColor: 'rgba(255,255,255,0.22)' },
  burst: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
