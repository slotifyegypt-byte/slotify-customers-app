import { StyleSheet, View } from 'react-native';

// expo-linear-gradient needs a native module rebuild to work, which isn't
// always available mid-iteration — this fakes a 2-stop gradient with stacked
// translucent bands (pure Views, no native dependency) instead.
const BAND_COUNT = 10;

interface SoftGradientProps {
  /** [r,g,b] shared by both stops. */
  rgb: [number, number, number];
  /** Alpha at the start and end of the fade. */
  fromAlpha: number;
  toAlpha: number;
  direction: 'horizontal' | 'vertical';
  /** Fraction (0-1) of the run where the fade begins ramping — flat at `fromAlpha` before this. */
  rampStart?: number;
}

export function SoftGradient({ rgb, fromAlpha, toAlpha, direction, rampStart = 0 }: SoftGradientProps) {
  const [r, g, b] = rgb;
  const bands = Array.from({ length: BAND_COUNT }, (_, i) => {
    const t = i / (BAND_COUNT - 1);
    const rampT = t < rampStart ? 0 : (t - rampStart) / (1 - rampStart || 1);
    const alpha = fromAlpha + (toAlpha - fromAlpha) * rampT;
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  });

  return (
    <View style={[StyleSheet.absoluteFill, direction === 'horizontal' ? styles.row : styles.column]}>
      {bands.map((color, i) => (
        <View key={i} style={[styles.band, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
  band: { flex: 1 },
});
