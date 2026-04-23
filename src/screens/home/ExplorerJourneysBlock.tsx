import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { colors, spacing } from '../../theme';
import { explorerJourneys } from '../../data/mockJourneys';

interface Props {
  onViewAll: () => void;
}

export function ExplorerJourneysBlock({ onViewAll }: Props) {
  const items = explorerJourneys.slice(0, 3);
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text variant="label" tone="muted">
            Explorer workshops
          </Text>
          <Text variant="caption" tone="muted">
            One-day classes to try new mediums
          </Text>
        </View>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text variant="small" tone="secondary" style={{ fontWeight: '600' }}>
            Explore all ›
          </Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {items.map((j) => (
          <Pressable key={j.id} onPress={onViewAll} style={styles.card}>
            <ImagePlaceholder
              style={{ width: '100%', height: 120 }}
              rounded="md"
              iconSize={32}
            />
            <Text variant="bodyBold" style={{ marginTop: spacing.sm }} numberOfLines={1}>
              {j.title}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {j.duration} · {j.dateAvailable ?? 'Upcoming'}
            </Text>
            <Text variant="caption" style={{ marginTop: 2, fontWeight: '700', color: colors.warning }}>
              ₹{j.price}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  scroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  card: {
    width: 180,
  },
});
