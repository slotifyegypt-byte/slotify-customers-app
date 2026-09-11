import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/theme';
import { getMyProfile } from '@/api/endpoints';

// Temporary readout — proves token attachment + 401→refresh interceptor.
// Replace with real Home UI in Phase 3.
export default function HomeScreen() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
  });

  return (
    <SafeAreaView style={s.root}>
      <Text style={s.heading}>Home</Text>

      {isLoading && <ActivityIndicator color={colors.brand} style={s.indicator} />}

      {isError && (
        <Text style={s.error}>
          GET /customers/me failed:{'\n'}
          {String((error as any)?.response?.data?.detail ?? error)}
        </Text>
      )}

      {data && (
        <View style={s.card}>
          <Text style={s.label}>GET /customers/me ✓</Text>
          <Text style={s.value}>id: {data.id}</Text>
          <Text style={s.value}>name: {data.name}</Text>
          <Text style={s.value}>email: {data.email ?? '—'}</Text>
          <Text style={s.value}>phone: {data.phone ?? '—'}</Text>
          <Text style={s.value}>lang: {data.preferred_language}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas, padding: 24 },
  heading: { fontSize: 22, fontFamily: 'PlusJakartaSans-Bold', color: colors.ink, marginBottom: 20 },
  indicator: { marginTop: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 4,
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { fontSize: 13, fontFamily: 'PlusJakartaSans-SemiBold', color: colors.brand, marginBottom: 8 },
  value: { fontSize: 13, fontFamily: 'PlusJakartaSans-Regular', color: colors.ink },
  error: { fontSize: 13, fontFamily: 'PlusJakartaSans-Regular', color: '#C4517C', marginTop: 40, lineHeight: 20 },
});
