import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { qrMatrix, qrRuns } from '../lib/qr';

interface Props {
  value: string;
  size?: number;
  accessibilityLabel: string;
}

const QUIET = 3; // modules of white around the code, as the QR standard asks (4) rounded to what fits

/** A QR code on a white tile whatever the app theme (scanners need dark on light), drawn with plain Views so it needs
 *  no native module. The module size is a whole number of pixels so every edge is crisp. */
export function QrCode({ value, size = 220, accessibilityLabel }: Props) {
  const { runs, unit, offset } = useMemo(() => {
    const matrix = qrMatrix(value);
    const total = matrix.length + QUIET * 2;
    const unit = Math.max(1, Math.floor(size / total));
    return { runs: qrRuns(matrix), unit, offset: Math.floor((size - matrix.length * unit) / 2) };
  }, [value, size]);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.tile, { width: size, height: size }]}
    >
      <View importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
        {runs.map((r) => (
          <View
            key={`${r.row}-${r.col}`}
            style={[styles.bar, { left: offset + r.col * unit, top: offset + r.row * unit, width: r.length * unit, height: unit }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden' },
  bar: { position: 'absolute', backgroundColor: '#15112B' },
});
