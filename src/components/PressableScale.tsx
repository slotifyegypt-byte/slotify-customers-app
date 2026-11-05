import { useState, type ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** How far it shrinks while held; 1 turns the effect off. */
  scaleTo?: number;
}

/** A pressable that gives a little under the finger: every tappable surface in the app uses it, so touch feels the same everywhere. */
export function PressableScale({
  style,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}: PressableScaleProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const to = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: Platform.OS !== 'web',
      speed: 40,
      bounciness: 3,
    }).start();

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) to(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        to(1);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
