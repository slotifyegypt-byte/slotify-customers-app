import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { colors, radius, spacing } from '@/theme';

// TODO i18n — every string below. Headers match the design's copy verbatim;
// answers are written to reflect what Slotify actually supports today (see
// customer-app-api-map.md §0.3/§11 — no reschedule endpoint, no in-app
// payment/refund processing) rather than the design's generic placeholder
// wording, so this never promises a flow the app can't back up.
const FAQ_ITEMS = [
  {
    question: 'How do I cancel a booking?',
    answer:
      'Open the booking from your Activity tab and tap Cancel. You don\'t need a reason, but please cancel as early as you can so the store can free up the slot.',
  },
  {
    question: 'How do I reschedule?',
    answer:
      'There\'s no direct reschedule yet — cancel the existing booking from Activity, then book the new time you want.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'Slotify doesn\'t take payment in the app. You pay the store directly when you arrive for your booking.',
  },
  {
    question: 'How do refunds work?',
    answer:
      'Since payment happens at the store rather than in the app, cancelling a booking here doesn\'t involve a charge or a refund.',
  },
  {
    question: 'Can I change my phone number?',
    answer:
      'Yes, from Profile > Edit Profile. Changes to your phone number are saved immediately without a verification step, so make sure you type it correctly.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable style={styles.item} onPress={() => setExpanded((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded }}>
      <View style={styles.itemHeader}>
        <ThemedText variant="bodyMedium" style={styles.question}>
          {question}
        </ThemedText>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </View>
      {expanded ? (
        <ThemedText variant="body" color="textSecondary" style={styles.answer}>
          {answer}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

export function HelpFAQScreen() {
  const [query, setQuery] = useState('');

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) => item.question.toLowerCase().includes(needle) || item.answer.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <Screen>
      <ScreenHeader title="Help & FAQ" />
      <ScrollView contentContainerStyle={styles.padded} keyboardShouldPersistTaps="handled">
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search help topics..." // TODO i18n
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
          />
        </View>

        {visibleItems.length ? (
          visibleItems.map((item) => <FAQItem key={item.question} {...item} />)
        ) : (
          <ThemedText variant="body" color="textSecondary" style={styles.empty}>
            No help topics match &quot;{query}&quot;.
          </ThemedText>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { marginBottom: spacing.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.backgroundMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm, color: colors.textPrimary },
  item: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  question: { flex: 1 },
  answer: { marginTop: spacing.xs },
  empty: { textAlign: 'center', marginTop: spacing.lg },
});
