import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { ThemedText } from '@/components/ThemedText';
import { useCreateSupportTicket } from '@/features/support/hooks/useSupportTicketMutations';
import { enter, spacing } from '@/theme';

import { SettingsGroup } from '../components/SettingsGroup';

// customer-app-api-map.md §11 — Call Support is real (device dialer).
const SUPPORT_PHONE_DISPLAY = '+20 10 023 4567';
const SUPPORT_PHONE_TEL = 'tel:+20100234567';

export function ContactUsScreen() {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const canSend = subject.trim().length > 0 && message.trim().length > 0;
  const createSupportTicket = useCreateSupportTicket();

  const handleCallSupport = () => {
    Linking.openURL(SUPPORT_PHONE_TEL);
  };

  // customer-app-api-map.md §11 — VERIFIED against the live backend's
  // /openapi.json (2026-09-20): a real `POST /support-tickets/` endpoint now
  // exists, so Send actually files a ticket instead of handing the message
  // off to the device's mail client.
  const handleSend = async () => {
    if (!canSend) return;
    try {
      await createSupportTicket.mutateAsync({ subject: subject.trim(), message: message.trim() });
      setSubject('');
      setMessage('');
      Alert.alert(t('contactUs.sentTitle'), t('contactUs.sentBody'));
    } catch {
      Alert.alert(t('contactUs.failedTitle'), t('contactUs.failedBody'));
    }
  };

  return (
    <Screen>
      <ScreenHeader title={t('contactUs.title')} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={enter(0)}>
            <SettingsGroup title={t('contactUs.groupReach')}>
              <ListRow
                title={t('contactUs.callSupport')}
                subtitle={`${SUPPORT_PHONE_DISPLAY} · ${t('contactUs.callHours')}`}
                icon="call-outline"
                iconTone="success"
                onPress={handleCallSupport}
              />
            </SettingsGroup>
          </Animated.View>

          <Animated.View entering={enter(1)} style={styles.messageGroup}>
            <ThemedText variant="captionStrong" color="textTertiary" style={styles.groupTitle}>
              {t('contactUs.groupMessage')}
            </ThemedText>
            <Card style={styles.form}>
              <TextField
                label={t('contactUs.subject')}
                value={subject}
                onChangeText={setSubject}
                placeholder={t('contactUs.subjectPlaceholder')}
                returnKeyType="next"
              />
              <TextField
                label={t('contactUs.message')}
                value={message}
                onChangeText={setMessage}
                placeholder={t('contactUs.messagePlaceholder')}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={styles.textarea}
              />
              <Button
                label={t('contactUs.send')}
                icon="paper-plane-outline"
                disabled={!canSend}
                loading={createSupportTicket.isPending}
                onPress={handleSend}
              />
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: 120,
    gap: 28,
  },
  messageGroup: { gap: spacing.xs },
  groupTitle: { paddingHorizontal: spacing.xs },
  form: { gap: spacing.md },
  textarea: { minHeight: 120, paddingTop: spacing.sm + 2, paddingBottom: spacing.sm + 2 },
});
