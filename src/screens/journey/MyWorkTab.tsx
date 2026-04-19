import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { mockArtworks, mockTimeline } from '../../data/mockStudent';
import { colors, radius, spacing } from '../../theme';

interface Props {
  onTapArtwork?: (artworkId: string) => void;
}

/**
 * Pass 1 — scope is CURRENT course only (This Journey's Work).
 * Shows artworks done + upcoming sessions as faded placeholders.
 */
export function MyWorkTab({ onTapArtwork }: Props) {
  const artworkByNum = new Map(mockArtworks.map((a) => [a.sessionNumber, a]));
  const tiles = mockTimeline.map((s) => {
    const artwork = artworkByNum.get(s.sessionNumber);
    return {
      sessionNumber: s.sessionNumber,
      title: s.title,
      date: s.date,
      done: !!artwork && s.status === 'attended',
      artworkId: artwork?.id,
    };
  });

  return (
    <View style={styles.container}>
      <Text variant="small" tone="muted" style={{ paddingHorizontal: spacing.xs }}>
        {mockArtworks.length} artworks this journey · {tiles.length - mockArtworks.length} upcoming
      </Text>
      <View style={styles.grid}>
        {tiles.map((t) => {
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
              key={t.sessionNumber}
              onPress={() => onTapArtwork!(t.artworkId!)}
              style={({ pressed }) => [
                styles.tile,
                pressed && { opacity: 0.85 },
              ]}
            >
              {content}
            </Pressable>
          ) : (
            <View key={t.sessionNumber} style={styles.tile}>
              {content}
            </View>
          );
        })}
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
});
