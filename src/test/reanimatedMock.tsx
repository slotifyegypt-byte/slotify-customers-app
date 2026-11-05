import { Image, ScrollView, Text, View } from 'react-native';

// Jest stand-in for react-native-reanimated (mapped in package.json). Reanimated needs native worklets, which
// do not exist under Jest; tests only need the pieces the app touches to render and to stay out of the way:
// entering animations that do nothing, animated components that are plain ones, and shared values.
function builder(): unknown {
  const b: unknown = new Proxy(function () {}, {
    get: (_t, prop) => (prop === 'build' ? () => undefined : () => b),
    apply: () => b,
  });
  return b;
}

export const FadeIn = builder();
export const FadeInDown = builder();
export const FadeInUp = builder();
export const FadeOut = builder();
export const ReduceMotion = { System: 'system', Always: 'always', Never: 'never' } as const;

export const useSharedValue = <T,>(value: T) => ({ value });
export const useAnimatedStyle = (fn: () => object) => fn();
export const useReducedMotion = () => false;
export const withTiming = <T,>(value: T) => value;
export const withSpring = <T,>(value: T) => value;
export const withDelay = <T,>(_ms: number, value: T) => value;
export const withRepeat = <T,>(value: T) => value;
export const cancelAnimation = () => undefined;
export const Easing = {
  out: (f: unknown) => f,
  inOut: (f: unknown) => f,
  ease: 0,
  linear: 0,
  cubic: 0,
  quad: 0,
};
export const interpolate = (value: number) => value;
export const createAnimatedComponent = <T,>(component: T) => component;

const Animated = { View, Text, ScrollView, Image, createAnimatedComponent };
export default Animated;
