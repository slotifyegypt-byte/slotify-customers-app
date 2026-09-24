import { StyleSheet, View } from 'react-native';

import { SoftGradient } from './SoftGradient';

// Signals there's more to scroll to on horizontal rails — mirrors the
// right-edge fade the design uses on every horizontal card row. The 3
// theme-background RGB values are `colors.backgroundMuted` (#F6F7F8) —
// this fades toward it rather than a hardcoded color.
export function HScrollFade() {
  return (
    <View pointerEvents="none" style={styles.fade}>
      <SoftGradient rgb={[246, 247, 248]} fromAlpha={0} toAlpha={1} direction="horizontal" />
    </View>
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 28 },
});
