import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { ThemedText } from '@/components/ThemedText';
import { isApiError } from '@/lib/api/errors';
import { spacing } from '@/theme';

import { JoinScanner } from '../components/JoinScanner';
import { useJoinLoyaltyProgram } from '../hooks/useJoinLoyaltyProgram';
import { extractJoinCode } from '../lib/joinCode';

/** Add a loyalty card by scanning the business's QR (or typing its code). The card is created at 0 stamps. */
export function LoyaltyJoinScreen() {
  const { t } = useTranslation();
  const { code: linked } = useLocalSearchParams<{ code?: string }>();
  const join = useJoinLoyaltyProgram();
  const [typed, setTyped] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const started = useRef(false);

  const submit = (input: string) => {
    if (join.isPending) return;
    if (!extractJoinCode(input)) {
      setMessage(t('loyalty.join.invalid'));
      return;
    }
    setMessage(null);
    join.mutate(input, {
      onSuccess: (card) => router.replace({ pathname: '/(tabs)/profile/loyalty-card', params: { id: card.id } }),
      onError: (e) => {
        const code = isApiError(e) ? e.code : '';
        setMessage(
          code === 'invalid_join_code'
            ? t('loyalty.join.unknown')
            : code === 'program_inactive'
              ? t('loyalty.join.paused')
              : code === 'rate_limited'
                ? t('loyalty.join.tooMany')
                : t('loyalty.join.failed'),
        );
      },
    });
  };

  // Opened from a slotify://loyalty/join/<code> link (for example the phone's own camera): join straight away.
  useEffect(() => {
    if (linked && !started.current) {
      started.current = true;
      submit(linked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, for the code the link carried
  }, [linked]);

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ScreenHeader title={t('loyalty.join.title')} subtitle={t('loyalty.join.subtitle')} />
        <View style={styles.body}>
          <JoinScanner onScan={submit} />
          <ThemedText variant="captionStrong" color="textSecondary">
            {t('loyalty.join.orType')}
          </ThemedText>
          <TextField
            label={t('loyalty.join.codeLabel')}
            value={typed}
            onChangeText={(v) => {
              setTyped(v);
              setMessage(null);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="ABCDE-FGHJK"
            returnKeyType="done"
            onSubmitEditing={() => submit(typed)}
          />
          {message ? (
            <ThemedText variant="caption" color="danger" accessibilityRole="alert">
              {message}
            </ThemedText>
          ) : null}
          <Button label={t('loyalty.join.add')} loading={join.isPending} onPress={() => submit(typed)} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  body: { paddingHorizontal: spacing.md, gap: spacing.md },
});
