import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { spacing } from '../../theme';
import { mockArtworks } from '../../data/mockStudent';
import { mockSkills, SKILL_META, SKILL_COLORS } from '../../data/mockSkills';

interface Props {
  onTapArtwork: (id: string) => void;
  onTapJourney: () => void;
}

export function RecentWorkBlock({ onTapArtwork, onTapJourney }: Props) {
  const latest = mockArtworks[mockArtworks.length - 1];
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const gains = mockSkills.history
    .filter((e) => new Date(e.date).getTime() >= cutoff)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.skill] = (acc[e.skill] ?? 0) + e.amount;
      return acc;
    }, {});
  const top = Object.entries(gains).sort((a, b) => b[1] - a[1])[0];
  const skill = top
    ? (top[0] as keyof typeof SKILL_META)
    : ('observation' as keyof typeof SKILL_META);
  const skillMeta = SKILL_META[skill];
  const skillColor = SKILL_COLORS[skill];

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="label" tone="muted">
          Recent progress
        </Text>
        <Pressable onPress={onTapJourney} hitSlop={8}>
          <Text variant="small" tone="secondary" style={{ fontWeight: '600' }}>
            See all ›
          </Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable onPress={() => onTapArtwork(latest.id)}>
          <ImagePlaceholder
            style={{ width: 96, height: 96 }}
            rounded="lg"
            iconSize={28}
          />
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text variant="bodyBold" numberOfLines={1}>
            {latest.sessionTitle}
          </Text>
          <Text variant="caption" tone="muted">
            Session {latest.sessionNumber}
          </Text>
          <View style={styles.skillNudge}>
            <View style={[styles.skillDot, { backgroundColor: skillColor }]} />
            <Text variant="small" tone="secondary" style={{ flex: 1 }}>
              {skillMeta.name} is growing fast
              {top ? ` · +${top[1]} this fortnight` : ''}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  skillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
});
