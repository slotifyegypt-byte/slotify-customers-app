import { StyleSheet, View } from 'react-native';

import { useColors } from '@/theme';

import { SoftGradient } from './SoftGradient';

function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** A soft fade at the right edge of a horizontal list, in the screen's own background colour, hinting that it scrolls. */
export function HScrollFade() {
  const colors = useColors();
  return (
    <View pointerEvents="none" style={styles.fade}>
      <SoftGradient
        rgb={rgbOf(colors.background)}
        fromAlpha={0}
        toAlpha={1}
        direction="horizontal"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 28 },
});
