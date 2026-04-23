import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { colors, radius, spacing } from '../../theme';
import { mockChat } from '../../data/mockChat';

interface Props {
  onTap: () => void;
}

export function TeacherBlock({ onTap }: Props) {
  return (
    <Pressable onPress={onTap}>
      <Card>
        <View style={styles.row}>
          <ImagePlaceholder
            style={{ width: 56, height: 56 }}
            rounded="pill"
            iconSize={22}
          />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text variant="caption" tone="muted">
              {mockChat.teacherRole}
            </Text>
            <Text variant="bodyBold" style={{ marginTop: 2 }}>
              {mockChat.teacherName}
            </Text>
          </View>
          <View style={styles.chatCta}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={colors.textPrimary}
            />
            <Text variant="small" style={{ marginLeft: 6, fontWeight: '600' }}>
              Chat
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
});
