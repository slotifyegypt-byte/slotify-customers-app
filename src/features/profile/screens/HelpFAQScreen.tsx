import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, ReduceMotion } from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { enter, fontFamily, radius, spacing, useColors } from '@/theme';

// Answers reflect what Slotify supports today (no reschedule endpoint, no in-app payment or refund
// processing; see customer-app-api-map.md §0.3/§11), so this never promises a flow the app can't back up.
const FAQ_IDS = ['1', '2', '3', '4', '5'] as const;

// One easing for every expansion; reduced motion simply swaps the content.
const EXPAND = LinearTransition.duration(220).reduceMotion(ReduceMotion.System);
const REVEAL = FadeIn.duration(220).reduceMotion(ReduceMotion.System);

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  return (
    <Animated.View layout={EXPAND}>
      <Card padding="none">
        <PressableScale
          onPress={() => setExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={question}
          accessibilityState={{ expanded }}
          scaleTo={0.99}
          style={styles.itemHeader}
        >
          <ThemedText variant="bodyMedium" style={styles.question}>
            {question}
          </ThemedText>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={expanded ? colors.brandAccent : colors.textTertiary}
          />
        </PressableScale>
        {expanded ? (
          <Animated.View entering={REVEAL} style={styles.answerWrap}>
            <ThemedText variant="body" color="textSecondary">
              {answer}
            </ThemedText>
          </Animated.View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

export function HelpFAQScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const items = useMemo(
    () => FAQ_IDS.map((id) => ({ id, question: t(`helpFaq.q${id}`), answer: t(`helpFaq.a${id}`) })),
    [t],
  );

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(needle) || item.answer.toLowerCase().includes(needle),
    );
  }, [query, items]);

  return (
    <Screen>
      <ScreenHeader title={t('helpFaq.title')} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={enter(0)}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: searchFocused ? colors.surface : colors.backgroundMuted,
                borderColor: searchFocused ? colors.brandAccent : 'transparent',
              },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('helpFaq.searchPlaceholder')}
              placeholderTextColor={colors.textTertiary}
              selectionColor={colors.brandAccent}
              accessibilityLabel={t('helpFaq.searchLabel')}
              returnKeyType="search"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={[styles.searchInput, { color: colors.textPrimary }]}
            />
            {query ? (
              <PressableScale
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel={t('helpFaq.clearSearch')}
                hitSlop={10}
              >
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </PressableScale>
            ) : null}
          </View>
        </Animated.View>

        {visibleItems.length ? (
          <View style={styles.list}>
            {visibleItems.map((item, index) => (
              <Animated.View key={item.id} entering={enter(index + 1)}>
                <FAQItem question={item.question} answer={item.answer} />
              </Animated.View>
            ))}
          </View>
        ) : (
          <EmptyState icon="search-outline" title={t('helpFaq.noMatch', { query: query.trim() })} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: 120,
    gap: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 16,
    paddingVertical: 10,
    // The bar itself shows focus; the browser's own outline would double it.
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  list: { gap: spacing.sm },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    minHeight: 56,
  },
  question: { flex: 1 },
  answerWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
});
