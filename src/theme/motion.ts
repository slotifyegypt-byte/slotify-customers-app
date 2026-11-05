import { FadeIn, FadeInDown, FadeInUp, ReduceMotion } from 'react-native-reanimated';

// One easing and one rhythm for the whole app. Every animation honours the system "reduce motion" setting
// (`ReduceMotion.System`): the content simply appears.
export const STAGGER_MS = 55;

/** A block rising into place; give each block in a column a rising `index` to stagger them. */
export const enter = (index = 0) =>
  FadeInDown.delay(Math.min(index, 8) * STAGGER_MS)
    .duration(420)
    .reduceMotion(ReduceMotion.System);

/** A block settling downwards (a header, a banner). */
export const enterFromTop = (index = 0) =>
  FadeInUp.delay(Math.min(index, 8) * STAGGER_MS)
    .duration(380)
    .reduceMotion(ReduceMotion.System);

/** A plain fade, for content that should not move. */
export const fade = (index = 0) =>
  FadeIn.delay(Math.min(index, 8) * STAGGER_MS)
    .duration(300)
    .reduceMotion(ReduceMotion.System);
