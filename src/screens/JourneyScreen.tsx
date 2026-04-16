import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { SubTabs } from '../components/SubTabs';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { colors, radius, spacing } from '../theme';
import {
  mockStudent,
  Peer,
  TimelineSession,
  TimelineTask,
} from '../data/mockStudent';
import { TimelineTab } from './journey/TimelineTab';
import { PeersTab } from './journey/PeersTab';
import { MyWorkTab } from './journey/MyWorkTab';
import { SessionPopup } from './journey/SessionPopup';
import { PeerPopup } from './journey/PeerPopup';

type SubKey = 'timeline' | 'peers' | 'mywork';

const SUB_TABS: { key: SubKey; label: string }[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'peers', label: 'Peers' },
  { key: 'mywork', label: 'My work' },
];

export function JourneyScreen() {
  const s = mockStudent;
  const [active, setActive] = useState<SubKey>('timeline');
  const [sessionOpen, setSessionOpen] = useState<TimelineSession | null>(null);
  const [peerOpen, setPeerOpen] = useState<Peer | null>(null);

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.courseRow}>
            <ImagePlaceholder
              style={{ width: 56, height: 56 }}
              rounded="lg"
              iconSize={22}
            />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text variant="h2">{s.course}</Text>
              <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
                {s.joinedDate}
              </Text>
            </View>
          </View>

          <View style={styles.stats}>
            <Stat value={`${s.classesAttended}`} label="Classes done" />
            <Divider />
            <Stat value={`${s.hwSubmitted}/${s.hwTotal}`} label="HW submitted" />
            <Divider />
            <Stat value={`${s.quizzesDone}`} label="Quizzes" />
          </View>
        </View>

        {/* Sticky sub-tabs */}
        <View style={styles.subTabsWrap}>
          <SubTabs tabs={SUB_TABS} active={active} onChange={setActive} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {active === 'timeline' && (
            <TimelineTab
              onTapSession={(sess) => setSessionOpen(sess)}
              onTapHwTask={(t: TimelineTask) => {
                /* wired in the HW submission popup task */
                console.log('HW task', t.id);
              }}
            />
          )}
          {active === 'peers' && <PeersTab onTapPeer={(p) => setPeerOpen(p)} />}
          {active === 'mywork' && <MyWorkTab />}
        </View>
      </ScrollView>

      <SessionPopup session={sessionOpen} onClose={() => setSessionOpen(null)} />
      <PeerPopup peer={peerOpen} onClose={() => setPeerOpen(null)} />
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="h3">{value}</Text>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.bg,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'flex-start',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
  },
  subTabsWrap: {
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
});
