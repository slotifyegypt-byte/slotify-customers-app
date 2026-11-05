import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { fontFamily, hueFor } from '@/theme';

// A photo that has not been uploaded (or has not loaded yet) shows the name's initial on a wash of its hue, so a
// missing image looks chosen, never broken.

interface PhotoProps {
  uri?: string | null;
  /** Names the thing pictured: its first letter fills the placeholder, and it picks the hue. */
  name: string;
  style?: StyleProp<ViewStyle>;
  /** Size of the placeholder initial. */
  initialSize?: number;
  /** hue: a wash of the name's colour. onDark: for use on the deep-indigo hero surface. */
  tone?: 'hue' | 'onDark';
  /** Drawn on top of the image (badges, buttons). */
  children?: ReactNode;
}

/** An image that fills its box, with a designed placeholder while there is none. */
export function Photo({ uri, name, style, initialSize = 40, tone = 'hue', children }: PhotoProps) {
  const hue = hueFor(name);
  const wash = tone === 'onDark' ? 'rgba(255, 255, 255, 0.16)' : `${hue}1F`;
  const ink = tone === 'onDark' ? 'rgba(255, 255, 255, 0.85)' : `${hue}66`;
  const letter = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={[styles.box, { backgroundColor: wash }, style]}>
      {/* The initial sits under the image, so a loaded photo covers it. */}
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <Text
          style={{
            color: ink,
            fontFamily: fontFamily.headingSemiBold,
            fontSize: initialSize,
            lineHeight: initialSize * 1.15,
          }}
        >
          {letter}
        </Text>
      </View>
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          accessibilityIgnoresInvertColors
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
