import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
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
  const isCustomer = item.sender_type === 'customer';
  return (
    <View style={[styles.bubbleRow, isCustomer ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
      <View style={[styles.bubbleColumn, isCustomer ? styles.bubbleColumnRight : styles.bubbleColumnLeft]}>
        <View style={[styles.bubble, isCustomer ? styles.bubbleCustomer : styles.bubbleStore]}>
          <ThemedText variant="body" color={isCustomer ? 'textOnBrand' : 'textPrimary'}>
            {item.message}
          </ThemedText>
        </View>
        {/* Timestamp sits outside the bubble on the page background (design
            has it small/gray under the bubble, not inside it), aligned to
            the same side as the bubble it belongs to. */}
        <ThemedText variant="caption" color="textSecondary" style={styles.timestamp}>
          {formatTime(item.created_at)}
        </ThemedText>
      </View>
    </View>
  );
}

function ChatHeader({ bookingId }: { bookingId: string }) {
  const colors = useColors();
  const styles = createStyles(colors);
  const booking = useBookingDetail(bookingId);
  const data = booking.data;
  // The API has no dedicated order/reference-number field (customer-app-api-map.md
  // §9) — the design mock shows a short "Order #_" reference, so a compact
  // stand-in is derived from the booking id rather than inventing a backend field.
  const orderRef = bookingId.slice(-4).toUpperCase();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back" // TODO i18n
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
      </Pressable>

      {data?.store_logo ? (
        <Image source={{ uri: data.store_logo }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]} />
      )}

      <View style={styles.headerTitles}>
        <ThemedText variant="h3" numberOfLines={1}>
          {data?.store_name ?? ''}
        </ThemedText>
        <ThemedText variant="caption" color="textSecondary">
          {/* TODO i18n */}
          Order #{orderRef}
        </ThemedText>
      </View>
    </View>
  );
}

export function OrderChatScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const {
    messages,
    isLoading,
    isError,
    refetch,
    sendMessage,
    isSending,
    markRead,
  } = useBookingChat(bookingId ?? '');
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

  const renderItem = useCallback(({ item }: ListRenderItemInfo<BookingMessage>) => <MessageBubble item={item} />, []);

  if (!bookingId) {
    return (
      <Screen>
        <EmptyState title="No booking selected" body="This chat has nothing to open." />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ChatHeader bookingId={bookingId} />

        <View style={styles.listWrap}>
          {isError ? (
            <EmptyState
              title="Couldn't load this chat"
              body="Check your connection and try again."
              actionLabel="Retry"
              onAction={() => refetch()}
            />
          ) : isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.brandAccent} />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <EmptyState title="No messages yet" body="Send a message to start the conversation." />
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
            placeholder="Type a message..." // TODO i18n
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            multiline
            maxLength={2000}
          />
          <Pressable
            style={[styles.sendButton, (!draft.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!draft.trim() || isSending}
            accessibilityRole="button"
            accessibilityLabel="Send message" // TODO i18n
          >
            <Ionicons name="send" size={18} color={colors.textOnBrand} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  backButton: {
    // Same circular light back-button treatment used elsewhere (e.g. the
    // explore header's back chevron): 36x36 pill on a soft neutral fill.
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 36, height: 36, borderRadius: radius.pill },
  avatarFallback: { backgroundColor: colors.backgroundMuted },
  headerTitles: { flex: 1 },
  // The message list gets its own light lavender wash (colors.brandTint)
  // distinct from the white header/composer bars, matching the design.
  listWrap: { flex: 1, backgroundColor: colors.brandTint },
  listContent: { padding: spacing.md, flexGrow: 1 },
  bubbleRow: { width: '100%', marginBottom: spacing.sm, flexDirection: 'row' },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubbleColumn: { maxWidth: '80%' },
  bubbleColumnRight: { alignItems: 'flex-end' },
  bubbleColumnLeft: { alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  // Uniform rounding on all corners — the reference design has no
  // chat-bubble "tail" asymmetry, so no per-corner radius override here.
  bubbleCustomer: { backgroundColor: colors.brandAccent },
  bubbleStore: { backgroundColor: colors.background },
  timestamp: { marginTop: spacing.xxs },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundMuted,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.brandAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: colors.disabled },
  });
