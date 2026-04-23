import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { Chip } from '../../components/Chip';
import { colors, radius, spacing } from '../../theme';
import { findArtworkById } from '../../data/mockStudent';
import { formatDateWithYear } from '../../utils/formatDate';

interface Props {
  artworkId: string | null;
  onClose: () => void;
}

/**
 * Image lightbox popover — dark backdrop, image in the centre, close button
 * overlaid on the top-right of the image itself. Tap backdrop to close.
 */
export function FullImagePopover({ artworkId, onClose }: Props) {
  const artwork = artworkId ? findArtworkById(artworkId) : undefined;
  const visible = !!artwork;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {artwork && (
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.imageWrap}>
              <ImagePlaceholder
                aspectRatio={1}
                iconSize={40}
                style={{ borderRadius: 0, borderWidth: 0 }}
              />
              <Pressable
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityLabel="Close"
                hitSlop={12}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.meta}>
              <View style={styles.tagRow}>
                <Chip label={`Session ${artwork.sessionNumber}`} tone="neutral" />
                <Text variant="small" tone="muted">
                  {formatDateWithYear(artwork.date)}
                </Text>
              </View>
              <Text variant="h3" style={{ marginTop: spacing.md }}>
                {artwork.sessionTitle}
              </Text>
              <Text variant="small" tone="secondary" style={{ marginTop: 4 }}>
                Drawing Foundation · Class {artwork.sessionNumber}
              </Text>
            </View>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    padding: spacing.lg,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
