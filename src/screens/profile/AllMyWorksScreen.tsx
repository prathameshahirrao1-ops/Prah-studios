// Spec:
//   - docs/spec/schema/artwork.md
//

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { colors, radius, spacing } from '../../theme';
import { formatDate } from '../../utils/formatDate';
import { mockArtworks, Artwork } from '../../data/mockStudent';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';
import { FullImagePopover } from './FullImageView';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'AllMyWorks'>;

type FilterKey = 'all' | 'journeys' | 'homework';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'journeys', label: 'Journeys' },
  { key: 'homework', label: 'Homework' },
];

export function AllMyWorksScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [openArtworkId, setOpenArtworkId] = useState<string | null>(null);

  // For mock: all artworks are session artworks → count as "journeys" too.
  // Homework artworks not yet modeled, so that tab shows empty state.
  const items: Artwork[] =
    filter === 'homework' ? [] : mockArtworks;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h2">All my works</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text
                  variant="small"
                  style={{
                    fontWeight: '600',
                    color: active ? colors.primaryText : colors.textPrimary,
                  }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="body" tone="muted" style={{ textAlign: 'center' }}>
              No homework artworks yet. Once teachers review submissions, they'll show up here.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {items.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setOpenArtworkId(a.id)}
                style={({ pressed }) => [
                  styles.tile,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <ImagePlaceholder aspectRatio={1} rounded="md" />
                <Text
                  variant="caption"
                  style={{ fontWeight: '600', marginTop: 6 }}
                  numberOfLines={1}
                >
                  {a.sessionTitle}
                </Text>
                <Text
                  variant="caption"
                  tone="muted"
                  style={{ marginTop: 2 }}
                  numberOfLines={1}
                >
                  Session {a.sessionNumber} · {formatDate(a.date)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <FullImagePopover
        artworkId={openArtworkId}
        onClose={() => setOpenArtworkId(null)}
      />
    </SafeAreaView>
  );
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    width: '47%',
  },
  empty: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
});
