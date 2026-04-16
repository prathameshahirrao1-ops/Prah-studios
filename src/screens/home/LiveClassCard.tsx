import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Card } from '../../components/Card';
import { Text } from '../../components/Text';
import { Chip } from '../../components/Chip';
import { colors, spacing } from '../../theme';
import { TimelineSession } from '../../data/mockStudent';

/**
 * Live-class card — shows during the class window.
 * A small red dot pulses to signal "live".
 */
export function LiveClassCard({ session, startTimeLabel }: { session: TimelineSession; startTimeLabel: string }) {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.liveRow}>
          <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
          <Text variant="label" style={styles.liveLabel}>
            LIVE · class in progress
          </Text>
        </View>
        <Chip label={`Started ${startTimeLabel}`} />
      </View>
      <Text variant="h2" style={{ marginTop: spacing.md }}>
        Session {session.sessionNumber} · {session.title}
      </Text>
      <Text variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
        Class is happening right now. Enjoy the class — we'll update this screen
        the moment it wraps up.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  liveLabel: {
    color: colors.error,
  },
});
