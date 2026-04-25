// Spec:
//   - docs/spec/ui-map/chat-screen.md
//   - docs/spec/schema/chat.md
//

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { colors, radius, spacing } from '../theme';
import { ChatMessage, mockChat } from '../data/mockChat';

interface Props {
  onClose: () => void;
}

export function ChatScreen({ onClose }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(mockChat.messages);
  const [quickSent, setQuickSent] = useState<'coming' | 'not_coming' | null>(null);
  const listRef = useRef<FlatList<any>>(null);

  // Auto-scroll to the newest message on mount and on each send.
  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 30);
    return () => clearTimeout(t);
  }, []);

  const grouped = useMemo(() => groupByDay(messages), [messages]);

  const send = (text: string, sender: 'parent' = 'parent') => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg: ChatMessage = {
      id: `local_${Date.now()}`,
      sender,
      text: trimmed,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 20);
  };

  const onQuickAction = (kind: 'coming' | 'not_coming') => {
    if (quickSent) return;
    setQuickSent(kind);
    send(
      kind === 'coming'
        ? 'Aarav is coming to class today.'
        : 'Aarav is not coming to class today.',
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={styles.closeBtn}
          accessibilityLabel="Close chat"
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.teacherAvatar}>
          <Text variant="bodyBold" tone="inverse">
            {mockChat.teacherName[0]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold">{mockChat.teacherName}</Text>
          <Text variant="caption" tone="muted">
            {mockChat.teacherRole} · Studio
          </Text>
        </View>
        <Pressable hitSlop={12} style={styles.closeBtn} accessibilityLabel="Call">
          <Ionicons name="call-outline" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={grouped}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) =>
            item.kind === 'divider' ? (
              <DayDivider label={item.label} />
            ) : (
              <MessageBubble msg={item.message} />
            )
          }
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Class-day quick actions */}
        {mockChat.isClassDay && (
          <View style={styles.quickRow}>
            <QuickChip
              label="Coming to class today"
              icon="checkmark-circle-outline"
              onPress={() => onQuickAction('coming')}
              selected={quickSent === 'coming'}
              disabled={quickSent !== null}
            />
            <QuickChip
              label="Not coming today"
              icon="close-circle-outline"
              onPress={() => onQuickAction('not_coming')}
              selected={quickSent === 'not_coming'}
              disabled={quickSent !== null}
            />
          </View>
        )}

        {/* Composer */}
        <View style={styles.composer}>
          <View style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
              maxLength={500}
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
              blurOnSubmit={false}
            />
          </View>
          <Pressable
            onPress={() => send(input)}
            disabled={!input.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              !input.trim() && { opacity: 0.4 },
              pressed && { opacity: 0.85 },
            ]}
            accessibilityLabel="Send message"
          >
            <Ionicons name="arrow-up" size={18} color={colors.primaryText} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isMe = msg.sender === 'parent';
  const isSystem = msg.sender === 'system';
  const isAdmin = msg.sender === 'admin';

  if (isSystem) {
    return (
      <View style={styles.systemRow}>
        <Text variant="caption" tone="muted" style={{ textAlign: 'center' }}>
          {msg.text}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
          isAdmin && styles.bubbleAdmin,
        ]}
      >
        {!isMe && msg.authorName && (
          <Text
            variant="caption"
            tone={isAdmin ? 'muted' : 'secondary'}
            style={{ marginBottom: 2, fontWeight: '600' }}
          >
            {msg.authorName}
            {isAdmin ? ' · Studio' : ''}
          </Text>
        )}
        <Text variant="body" tone={isMe ? 'inverse' : 'primary'}>
          {msg.text}
        </Text>
      </View>
      <Text variant="caption" tone="muted" style={styles.timestamp}>
        {formatTime(msg.sentAt)}
      </Text>
    </View>
  );
}

function DayDivider({ label }: { label: string }) {
  return (
    <View style={styles.dayDivider}>
      <View style={styles.dayLine} />
      <Text variant="caption" tone="muted" style={styles.dayLabel}>
        {label}
      </Text>
      <View style={styles.dayLine} />
    </View>
  );
}

function QuickChip({
  label,
  icon,
  onPress,
  selected,
  disabled,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  selected: boolean;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.quickChip,
        selected && styles.quickChipSelected,
        disabled && !selected && { opacity: 0.5 },
        pressed && !disabled && { opacity: 0.9 },
      ]}
    >
      <Ionicons
        name={icon}
        size={14}
        color={selected ? colors.primaryText : colors.textPrimary}
        style={{ marginRight: spacing.xs }}
      />
      <Text
        variant="small"
        tone={selected ? 'inverse' : 'primary'}
        style={{ fontWeight: '600' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type GroupedItem =
  | { kind: 'divider'; key: string; label: string }
  | { kind: 'message'; key: string; message: ChatMessage };

function groupByDay(messages: ChatMessage[]): GroupedItem[] {
  const out: GroupedItem[] = [];
  let lastDay = '';
  for (const m of messages) {
    const day = new Date(m.sentAt).toDateString();
    if (day !== lastDay) {
      out.push({ kind: 'divider', key: `d_${day}`, label: formatDay(m.sentAt) });
      lastDay = day;
    }
    out.push({ kind: 'message', key: m.id, message: m });
  }
  return out;
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },

  row: {
    alignItems: 'flex-start',
  },
  rowMe: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.sm,
  },
  bubbleThem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleAdmin: {
    backgroundColor: colors.surfaceAlt,
  },
  timestamp: {
    marginTop: 2,
    marginHorizontal: spacing.xs,
  },

  systemRow: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },

  dayDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dayLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dayLabel: {
    paddingHorizontal: spacing.sm,
  },

  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surfaceAlt,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  quickChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 140,
    paddingVertical: 0,
    outlineWidth: 0,          // web: hide focus ring
  } as any,
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
