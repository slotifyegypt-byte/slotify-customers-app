import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export default function OrderChatScreen() {
  return (
    <SafeAreaView style={s.root}>
      <Text style={s.label}>Order Chat</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas },
  label: { fontSize: 17, fontWeight: '600', color: colors.ink },
});
