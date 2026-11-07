import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { TextField } from '@/components/TextField';
import { ThemedText } from '@/components/ThemedText';
import { radius, shadows, spacing, useColors, type Colors } from '@/theme';

import {
  REPORT_REASONS,
  buildReportTicket,
  type ReportKind,
  type ReportReason,
} from '../api/report';
import { useCreateSupportTicket } from '../hooks/useSupportTicketMutations';
import { useHiddenContentStore } from '../store/hiddenContentStore';

const REASON_KEYS: Record<ReportReason, string> = {
  spam: 'report.reasonSpam',
  offensive: 'report.reasonOffensive',
  fake: 'report.reasonFake',
  other: 'report.reasonOther',
};

interface ReportSheetProps {
  /** What is being reported; `null` keeps the sheet closed. */
  target: { kind: ReportKind; id: string; context?: string } | null;
  onClose: () => void;
}

/**
 * A bottom sheet to report a review or a business chat message (App Store
 * guideline 1.2, Google Play UGC policy). The report goes to the support team
 * as a ticket, and the reported item is hidden on this device straight away.
 */
// A little longer than the Modal's slide-out animation.
const SHEET_DISMISS_MS = 450;

export function ReportSheet({ target, onClose }: ReportSheetProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = createStyles(colors);
  const createTicket = useCreateSupportTicket();
  const hide = useHiddenContentStore((s) => s.hide);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');

  // Every way out of the sheet leaves a fresh form for the next report.
  const close = () => {
    setReason(null);
    setNote('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!target || !reason) return;
    try {
      await createTicket.mutateAsync(
        buildReportTicket({
          kind: target.kind,
          targetId: target.id,
          reason,
          note,
          context: target.context,
        }),
      );
    } catch {
      Alert.alert(t('report.failedTitle'), t('report.failedBody'));
      return;
    }
    hide(target.kind, target.id);
    close();
    // On iOS an alert raised while the sheet is still sliding away is silently dropped, so the customer would never
    // see that the report went through (and might send it again). Wait for the slide to finish.
    setTimeout(() => Alert.alert(t('report.sentTitle'), t('report.sentBody')), SHEET_DISMISS_MS);
  };

  return (
    <Modal visible={target !== null} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={styles.backdrop}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <ThemedText variant="h2">
                {target?.kind === 'message' ? t('report.messageTitle') : t('report.reviewTitle')}
              </ThemedText>
              <ThemedText variant="body" color="textSecondary">
                {t('report.subtitle')}
              </ThemedText>
              <View style={styles.reasons}>
                {REPORT_REASONS.map((value) => (
                  <Chip
                    key={value}
                    label={t(REASON_KEYS[value])}
                    selected={reason === value}
                    onPress={() => setReason(value)}
                  />
                ))}
              </View>
              <TextField
                label={t('report.noteLabel')}
                value={note}
                onChangeText={setNote}
                placeholder={t('report.notePlaceholder')}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
                style={styles.note}
              />
              <Button
                label={t('report.submit')}
                disabled={!reason}
                loading={createTicket.isPending}
                onPress={handleSubmit}
              />
              <Button label={t('common.cancel')} variant="ghost" onPress={close} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    backdrop: { flex: 1, backgroundColor: colors.overlay },
    sheet: {
      maxHeight: '85%',
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      ...shadows.lg,
    },
    content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
    reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    note: { minHeight: 88, paddingTop: spacing.sm + 2, paddingBottom: spacing.sm + 2 },
  });
