import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../components/Card';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { Peer, mockPeers } from '../../data/mockStudent';
import { colors, radius, spacing } from '../../theme';

interface Props {
  onTapPeer: (peer: Peer) => void;
}

export function PeersTab({ onTapPeer }: Props) {
  return (
    <View style={styles.container}>
      <Text variant="small" tone="muted" style={{ paddingHorizontal: spacing.xs }}>
        {mockPeers.length} classmates in your batch
      </Text>
      <View style={styles.list}>
        {mockPeers.map((p) => (
          <PeerCard key={p.id} peer={p} onPress={() => onTapPeer(p)} />
        ))}
      </View>
    </View>
  );
}

function PeerCard({ peer, onPress }: { peer: Peer; onPress: () => void }) {
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text variant="bodyBold" tone="inverse">
            {peer.firstName[0]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold">
            {peer.firstName} {peer.lastName[0]}.
          </Text>
          <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
            Member since {peer.memberSince}
          </Text>
        </View>
      </View>

      {peer.artworks.length > 0 ? (
        <View style={styles.thumbRow}>
          {peer.artworks.slice(0, 3).map((a) => (
            <View key={a.id} style={styles.thumbWrap}>
              <ImagePlaceholder aspectRatio={1} rounded="md" />
              <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
                Session {a.sessionNumber}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text variant="small" tone="muted" style={{ marginTop: spacing.md }}>
          No artworks yet
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  thumbWrap: {
    flex: 1,
  },
});
