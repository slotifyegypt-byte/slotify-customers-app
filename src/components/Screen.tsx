import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/theme';

interface ScreenProps extends ViewProps {
  edges?: Edge[];
  background?: keyof typeof colors;
}

export function Screen({ children, style, edges = ['top', 'bottom'], background = 'background', ...rest }: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.flex, { backgroundColor: colors[background] }]}
    >
      <View style={[styles.flex, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
