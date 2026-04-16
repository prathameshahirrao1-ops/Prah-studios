import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { mockArtworks, mockTimeline } from '../../data/mockStudent';
import { colors, radius, spacing } from '../../theme';

/**
 * Pass 1 — scope is CURRENT course only (This Journey's Work).
 * Shows artworks done + upcoming sessions as faded placeholders.
 */
export function MyWorkTab() {
  const doneIds = new Set(mockArtworks.map((a) => a.sessionNumber));
  const tiles = mockTimeline.map((s) => ({
    sessionNumber: s.sessionNumber,
    title: s.title,
    date: s.date,
    done: doneIds.has(s.sessionNumber) && s.status === 'attended',
  }));

  return (
    <View style={styles.container}>
      <Text variant="small" tone="muted" style={{ paddingHorizontal: spacing.xs }}>
        {mockArtworks.length} artworks this journey · {tiles.length - mockArtworks.length} upcoming
      </Text>
      <View style={styles.grid}>
        {tiles.map((t) => (
          <View key={t.sessionNumber} style={styles.tile}>
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
          </View>
        ))}
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
