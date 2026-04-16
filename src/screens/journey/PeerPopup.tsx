import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Popup } from '../../components/Popup';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { Peer } from '../../data/mockStudent';
import { colors, radius, spacing } from '../../theme';

interface Props {
  peer: Peer | null;
  onClose: () => void;
}

export function PeerPopup({ peer, onClose }: Props) {
  if (!peer) {
    return <Popup visible={false} title="" onClose={onClose} children={<View />} />;
  }

  // Group artworks by session number
  const grouped = peer.artworks.reduce<Record<number, typeof peer.artworks>>((acc, a) => {
    (acc[a.sessionNumber] ??= []).push(a);
    return acc;
  }, {});
  const sessionNumbers = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <Popup visible onClose={onClose} title={`${peer.firstName} ${peer.lastName[0]}.`} fullHeight>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text variant="h2" tone="inverse">
            {peer.firstName[0]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="h3">
            {peer.firstName} {peer.lastName[0]}.
          </Text>
          <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
            Member since {peer.memberSince}
          </Text>
          <Text variant="small" tone="muted">
            Journey · {peer.currentJourney}
          </Text>
        </View>
      </View>

      {peer.artworks.length === 0 ? (
        <Text variant="body" tone="muted">
          {peer.firstName} hasn't shared any work yet.
        </Text>
      ) : (
        sessionNumbers.map((n) => (
          <View key={n}>
            <Text variant="label" tone="muted">
              Session {n}
            </Text>
            <View style={styles.worksRow}>
              {grouped[n].map((a) => (
                <View key={a.id} style={styles.workTile}>
                  <ImagePlaceholder aspectRatio={1} rounded="lg" iconSize={24} />
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </Popup>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worksRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: spacing.sm,
  },
  workTile: {
    width: '48%',
  },
});
