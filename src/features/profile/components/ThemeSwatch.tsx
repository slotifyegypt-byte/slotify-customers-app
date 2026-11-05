import { StyleSheet, View } from 'react-native';

import type { ThemePreference } from '@/lib/theme/themePreferenceStore';
import { colorSchemes, radius, useColors } from '@/theme';

const WIDTH = 64;
const HEIGHT = 52;

/** A miniature screen in one scheme: canvas, a white-ish card with two text lines, and a brand button. */
function Mini({ scheme }: { scheme: 'light' | 'dark' }) {
  const c = colorSchemes[scheme];
  return (
    <View style={[styles.mini, { backgroundColor: c.background }]}>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={[styles.line, { width: '70%', backgroundColor: c.textPrimary }]} />
        <View style={[styles.line, { width: '45%', backgroundColor: c.textTertiary }]} />
      </View>
      <View style={[styles.button, { backgroundColor: c.brand }]} />
    </View>
  );
}

/** What an appearance option looks like: the light or dark mini screen, or both halves for "System". */
export function ThemeSwatch({ mode }: { mode: ThemePreference }) {
  const colors = useColors();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, { borderColor: colors.border }]}
    >
      {mode === 'system' ? (
        <>
          <View style={styles.half}>
            <Mini scheme="light" />
          </View>
          <View style={styles.half}>
            <View style={styles.shifted}>
              <Mini scheme="dark" />
            </View>
          </View>
        </>
      ) : (
        <Mini scheme={mode} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  half: { width: WIDTH / 2, height: HEIGHT, overflow: 'hidden' },
  shifted: { marginLeft: -WIDTH / 2 },
  mini: { width: WIDTH, height: HEIGHT, padding: 7, gap: 5 },
  card: { borderRadius: 5, borderWidth: StyleSheet.hairlineWidth * 2, padding: 5, gap: 3 },
  line: { height: 3, borderRadius: 2 },
  button: { width: 22, height: 7, borderRadius: 4 },
});
