import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Popup } from '../../components/Popup';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { Stars } from '../../components/Stars';
import { TimelineSession, mockPeers } from '../../data/mockStudent';
import { colors, radius, spacing } from '../../theme';

interface Props {
  session: TimelineSession | null;
  onClose: () => void;
  onTapArtwork?: (artworkId: string) => void;
}

export function SessionPopup({ session, onClose, onTapArtwork }: Props) {
  if (!session) {
    return <Popup visible={false} title="" onClose={onClose} children={<View />} />;
  }

  // Peer works for this session — pick peers who have an artwork from this session number
  const peerWorks = mockPeers
    .flatMap((p) =>
      p.artworks
        .filter((a) => a.sessionNumber === session.sessionNumber)
        .map((a) => ({ peer: p, artwork: a })),
    )
    .slice(0, 4);

  return (
    <Popup visible onClose={onClose} title={session.title} fullHeight>
      {/* Key concepts */}
      <View>
        <Text variant="label" tone="muted">
          Key concepts
        </Text>
        <View style={{ marginTop: spacing.sm }}>
          {session.keyConcepts.map((k) => (
            <View key={k} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text variant="body" tone="secondary" style={{ flex: 1 }}>
                {k}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Your work */}
      <View>
        <Text variant="label" tone="muted">
          Your work
        </Text>
        <Pressable
          onPress={() => session.yourWorkId && onTapArtwork?.(session.yourWorkId)}
          disabled={!session.yourWorkId || !onTapArtwork}
          style={({ pressed }) => [
            { marginTop: spacing.sm },
            pressed && session.yourWorkId && onTapArtwork && { opacity: 0.85 },
          ]}
        >
          <ImagePlaceholder aspectRatio={16 / 10} rounded="lg" iconSize={28} />
        </Pressable>
      </View>

      {/* Skills practiced */}
      <View>
        <Text variant="label" tone="muted">
          Skills practiced
        </Text>
        <View style={styles.skillList}>
          {(session.skills ?? []).map((s) => (
            <View key={s.name} style={styles.skillRow}>
              <Text variant="body">{s.name}</Text>
              <Stars value={s.stars} />
            </View>
          ))}
        </View>
      </View>

      {/* Peers work */}
      <View>
        <Text variant="label" tone="muted">
          Peers' work
        </Text>
        {peerWorks.length > 0 ? (
          <View style={styles.peerGrid}>
            {peerWorks.map(({ peer, artwork }) => (
              <Pressable
                key={artwork.id}
                onPress={() => onTapArtwork?.(artwork.id)}
                disabled={!onTapArtwork}
                style={({ pressed }) => [
                  styles.peerTile,
                  pressed && onTapArtwork && { opacity: 0.85 },
                ]}
              >
                <ImagePlaceholder aspectRatio={1} rounded="md" />
                <View style={styles.peerFoot}>
                  <View style={styles.peerAvatar}>
                    <Text variant="caption" tone="inverse">
                      {peer.firstName[0]}
                    </Text>
                  </View>
                  <Text variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
                    {peer.firstName}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text variant="small" tone="muted" style={{ marginTop: spacing.sm }}>
            No peer work yet for this session.
          </Text>
        )}
      </View>
    </Popup>
  );
}

const styles = StyleSheet.create({
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginTop: 10,
    marginRight: spacing.md,
  },
  skillList: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  peerGrid: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: spacing.md,
  },
  peerTile: {
    width: '48%',
  },
  peerFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  peerAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
