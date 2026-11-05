import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useColors } from '@/theme';

/** A hairline rule. */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  return (
    <View
      style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.divider }, style]}
    />
  );
}
