import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { useCreateSupportTicket } from '@/features/support/hooks/useSupportTicketMutations';
import { radius, spacing, useColors, type Colors } from '@/theme';

// customer-app-api-map.md §11 — Call Support is real (device dialer).
const SUPPORT_PHONE_DISPLAY = '+20 10 023 4567 · 9am–9pm daily'; // TODO i18n
const SUPPORT_PHONE_TEL = 'tel:+20100234567';

export function ContactUsScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
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
      Alert.alert(
        "Message sent" /* TODO i18n */,
        "We've received your message and will get back to you soon." /* TODO i18n */,
      );
    } catch {
      Alert.alert(
        "Couldn't send your message" /* TODO i18n */,
        'Please check your connection and try again.' /* TODO i18n */,
      );
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Contact Us" />
      <ScrollView contentContainerStyle={styles.padded} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.callCard} onPress={handleCallSupport} accessibilityRole="button">
          <View style={styles.callIconWell}>
            <Ionicons name="call" size={18} color={colors.success} />
          </View>
          <View style={styles.flexShrink}>
            <ThemedText variant="bodyMedium">Call Support</ThemedText>
            <ThemedText variant="caption" color="textSecondary">
              {SUPPORT_PHONE_DISPLAY}
            </ThemedText>
          </View>
        </Pressable>

        <View style={styles.formCard}>
          <ThemedText variant="caption" color="textSecondary" style={styles.label}>
            SUBJECT
          </ThemedText>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="What's this about?" // TODO i18n
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />

          <ThemedText variant="caption" color="textSecondary" style={styles.label}>
            MESSAGE
          </ThemedText>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us more..." // TODO i18n
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <Button
            label="Send"
            disabled={!canSend}
            loading={createSupportTicket.isPending}
            onPress={handleSend}
            style={styles.sendButton}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    padded: { padding: spacing.lg, paddingBottom: spacing.xxl },
    title: { marginBottom: spacing.lg },
    callCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    callIconWell: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      backgroundColor: colors.successTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flexShrink: { flexShrink: 1 },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: spacing.md,
    },
    label: { marginBottom: spacing.xxs, marginTop: spacing.md },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      color: colors.textPrimary,
    },
    textarea: { minHeight: 110 },
    sendButton: { marginTop: spacing.lg },
  });
