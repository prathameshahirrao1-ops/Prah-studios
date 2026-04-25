// Spec:
//   - docs/spec/schema/artwork.md
//

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { mockArtworks, mockTimeline } from '../../data/mockStudent';
import {
  allSketchbookPieces,
  useSketchbookState,
} from '../../data/mockSketchbook';
import { colors, radius, spacing } from '../../theme';

interface Props {
  onTapArtwork?: (artworkId: string) => void;
}

/**
 * Pass 1 — scope is CURRENT course only (This Journey's Work).
 * Shows artworks done + upcoming sessions as faded placeholders.
 */
export function MyWorkTab({ onTapArtwork }: Props) {
  // Class artworks (session-linked, Loop 1 output)
  const artworkByNum = new Map(mockArtworks.map((a) => [a.sessionNumber, a]));
  const classTiles = mockTimeline.map((s) => {
    const artwork = artworkByNum.get(s.sessionNumber);
    return {
      key: `s-${s.sessionNumber}`,
      sessionNumber: s.sessionNumber,
      title: s.title,
      done: !!artwork && s.status === 'attended',
      artworkId: artwork?.id,
    };
  });

  // Sketchbook pieces (Loop 4 output)
  const sbState = useSketchbookState();
  const sbPieces = allSketchbookPieces(sbState);

  return (
    <View style={styles.container}>
      <Text variant="small" tone="muted" style={{ paddingHorizontal: spacing.xs }}>
        {mockArtworks.length} artworks this journey ·{' '}
        {classTiles.length - mockArtworks.length} upcoming
        {sbPieces.length > 0 && ` · ${sbPieces.length} sketchbook`}
      </Text>

      {/* Sketchbook section (only shown if student has uploaded any) */}
      {sbPieces.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="color-palette-outline"
              size={16}
              color={colors.warning}
            />
            <Text
              variant="label"
              tone="muted"
              style={{ marginLeft: spacing.xs }}
            >
              Sketchbook
            </Text>
          </View>
          <View style={styles.grid}>
            {sbPieces.map((sb) => (
              <View key={sb.id} style={styles.tile}>
                <View style={styles.thumbWrap}>
                  <ImagePlaceholder aspectRatio={1} rounded="lg" />
                  {sb.status === 'submitted_pending_review' && (
                    <View style={styles.statusPill}>
                      <Text
                        variant="caption"
                        tone="inverse"
                        style={{ fontWeight: '600' }}
                      >
                        In review
                      </Text>
                    </View>
                  )}
                  {sb.status === 'portfolio_only' && (
                    <View style={[styles.statusPill, styles.statusPillMuted]}>
                      <Text variant="caption" style={{ fontWeight: '600' }}>
                        Portfolio
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  variant="small"
                  tone="primary"
                  style={{ marginTop: spacing.xs }}
                  numberOfLines={1}
                >
                  {sb.title}
                </Text>
                <Text variant="caption" tone="muted">
                  {sb.status === 'reviewed'
                    ? 'Reviewed'
                    : sb.status === 'submitted_pending_review'
                      ? 'Awaiting review'
                      : 'Portfolio'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Class artworks section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="school-outline" size={16} color={colors.textMuted} />
          <Text
            variant="label"
            tone="muted"
            style={{ marginLeft: spacing.xs }}
          >
            Class work
          </Text>
        </View>
        <View style={styles.grid}>
          {classTiles.map((t) => {
            const tappable = t.done && t.artworkId && onTapArtwork;
            const content = (
              <>
                <View style={[styles.thumbWrap, !t.done && styles.thumbMuted]}>
                  <ImagePlaceholder aspectRatio={1} rounded="lg" />
                </View>
                <Text
                  variant="small"
                  tone={t.done ? 'primary' : 'muted'}
                  style={{ marginTop: spacing.xs }}
                  numberOfLines={1}
                >
                  {t.title}
                </Text>
                <Text variant="caption" tone="muted">
                  Session {t.sessionNumber}
                </Text>
              </>
            );
            return tappable ? (
              <Pressable
                key={t.key}
                onPress={() => onTapArtwork!(t.artworkId!)}
                style={({ pressed }) => [
                  styles.tile,
                  pressed && { opacity: 0.85 },
                ]}
              >
                {content}
              </Pressable>
            ) : (
              <View key={t.key} style={styles.tile}>
                {content}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const GAP = 12;

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: GAP,
    rowGap: spacing.lg,
  },
  tile: {
    width: `48%`,
  },
  thumbWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  thumbMuted: {
    opacity: 0.4,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  statusPill: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  statusPillMuted: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
