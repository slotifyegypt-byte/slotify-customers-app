import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Photo } from '@/components/Photo';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import { useBookingDetail } from '@/features/booking/hooks/useBookingDetail';
import { radius, spacing, useColors, type Colors } from '@/theme';

import type { BookingMessage } from '../api/schemas';
import { useBookingChat } from '../hooks/useBookingChat';

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function MessageBubble({ item }: { item: BookingMessage }) {
  const styles = createStyles(useColors());
  const isCustomer = item.sender === 'customer';
  return (
    <View style={[styles.bubbleRow, isCustomer ? styles.bubbleRowEnd : styles.bubbleRowStart]}>
      <View style={[styles.bubbleColumn, isCustomer ? styles.alignEnd : styles.alignStart]}>
        <View style={[styles.bubble, isCustomer ? styles.bubbleCustomer : styles.bubbleStore]}>
          <ThemedText variant="body" color={isCustomer ? 'textOnBrand' : 'textPrimary'}>
            {item.message}
          </ThemedText>
        </View>
        <ThemedText variant="captionSmall" color="textTertiary" style={styles.timestamp}>
          {formatTime(item.created_at)}
        </ThemedText>
      </View>
    </View>
  );
}

function ChatHeader({ bookingId }: { bookingId: string }) {
  const { t } = useTranslation();
  const styles = createStyles(useColors());
  const booking = useBookingDetail(bookingId);
  const data = booking.data;
  // The API has no dedicated order/reference-number field (customer-app-api-map.md
  // §9), so a compact stand-in is derived from the booking id rather than inventing a backend field.
  const orderRef = bookingId.slice(-4).toUpperCase();
  const name = data?.store_name ?? '';

  return (
    <View style={styles.header}>
      <IconButton
        icon={I18nManager.isRTL ? 'chevron-forward' : 'chevron-back'}
        onPress={() => router.back()}
        accessibilityLabel={t('chat.back')}
        size={40}
      />
      <Photo
        uri={data?.store_logo}
        name={name || t('chat.headerFallback')}
        style={styles.avatar}
        initialSize={16}
      />
      <View style={styles.headerTitles}>
        <ThemedText variant="h3" numberOfLines={1}>
          {name || t('chat.headerFallback')}
        </ThemedText>
        <ThemedText variant="caption" color="textTertiary">
          {t('chat.orderRef', { ref: orderRef })}
        </ThemedText>
      </View>
    </View>
  );
}

function ChatSkeleton() {
  const styles = createStyles(useColors());
  return (
    <View style={styles.skeletons}>
      <Skeleton width="62%" height={44} radius={radius.lg} />
      <View style={styles.skeletonEnd}>
        <Skeleton width="48%" height={44} radius={radius.lg} />
      </View>
      <Skeleton width="70%" height={64} radius={radius.lg} />
    </View>
  );
}

export function OrderChatScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = createStyles(colors);
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { messages, isLoading, isError, refetch, sendMessage, isSending, markRead } =
    useBookingChat(bookingId ?? '');
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<BookingMessage>>(null);

  // Mark the thread read whenever this screen is focused (initial open and
  // any time the user navigates back to it), per customer-app-api-map.md §10.
  useFocusEffect(
    useCallback(() => {
      if (bookingId) {
        markRead();
      }
    }, [bookingId, markRead]),
  );

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;
    setDraft('');
    try {
      await sendMessage(trimmed);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch {
      setDraft(trimmed); // restore so the customer doesn't lose what they typed
    }
  }, [draft, isSending, sendMessage]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<BookingMessage>) => <MessageBubble item={item} />,
    [],
  );

  if (!bookingId) {
    return (
      <Screen>
        <EmptyState
          icon="chatbubbles-outline"
          title={t('chat.noBookingTitle')}
          body={t('chat.noBookingBody')}
        />
      </Screen>
    );
  }

  const canSend = draft.trim().length > 0 && !isSending;

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ChatHeader bookingId={bookingId} />

        <View style={styles.flex}>
          {isError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title={t('chat.errorTitle')}
              body={t('chat.errorBody')}
              actionLabel={t('common.retry')}
              onAction={() => refetch()}
            />
          ) : isLoading ? (
            <ChatSkeleton />
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <EmptyState
                  icon="chatbubbles-outline"
                  title={t('chat.emptyTitle')}
                  body={t('chat.emptyBody')}
                />
              }
            />
          )}
        </View>

        <View style={styles.composer}>
          {/* Photo attachments aren't built on the backend yet (doc §0.3/§10) —
              there's nothing functional to wire an attach button to, so it's
              intentionally left out rather than faking one. */}
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('chat.inputPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            multiline
            maxLength={2000}
          />
          <PressableScale
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel={t('chat.send')}
            scaleTo={0.92}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={canSend ? colors.textOnBrand : colors.textTertiary}
            />
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.gutter,
      paddingVertical: spacing.sm,
    },
    avatar: { width: 40, height: 40, borderRadius: radius.pill, overflow: 'hidden' },
    headerTitles: { flex: 1, minWidth: 0 },
    skeletons: { padding: spacing.gutter, gap: spacing.sm },
    skeletonEnd: { alignItems: 'flex-end' },
    listContent: { paddingHorizontal: spacing.gutter, paddingVertical: spacing.md, flexGrow: 1 },
    bubbleRow: { width: '100%', marginBottom: spacing.sm, flexDirection: 'row' },
    bubbleRowEnd: { justifyContent: 'flex-end' },
    bubbleRowStart: { justifyContent: 'flex-start' },
    bubbleColumn: { maxWidth: '80%' },
    alignEnd: { alignItems: 'flex-end' },
    alignStart: { alignItems: 'flex-start' },
    bubble: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
    },
    bubbleCustomer: { backgroundColor: colors.brand },
    bubbleStore: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: colors.border,
    },
    timestamp: { marginTop: spacing.xxs },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: spacing.gutter,
      paddingVertical: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth * 2,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.xs,
    },
    input: {
      flex: 1,
      maxHeight: 120,
      minHeight: 44,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      backgroundColor: colors.backgroundMuted,
      color: colors.textPrimary,
      fontSize: 15,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.brand,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: { backgroundColor: colors.backgroundMuted },
  });
