import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { SubTabs } from '../../components/SubTabs';
import { Popup } from '../../components/Popup';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { colors, radius, spacing } from '../../theme';
import {
  explorerJourneys,
  masterJourneys,
  type JourneyCourse,
} from '../../data/mockJourneys';
import { SKILL_COLORS, SKILL_META } from '../../data/mockSkills';

type Tab = 'master' | 'explorer';

export function JourneysScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<Tab>('explorer');
  const [selected, setSelected] = useState<JourneyCourse | null>(null);

  const courses = tab === 'master' ? masterJourneys : explorerJourneys;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pageHeader}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h2">Journeys</Text>
      </View>

      <SubTabs
        tabs={[
          { key: 'explorer', label: 'Explorer workshops' },
          { key: 'master', label: 'Master courses' },
        ]}
        active={tab}
        onChange={(k) => setTab(k as Tab)}
        style={styles.tabs}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'master' && (
          <View style={styles.legend}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
            <Text variant="caption" tone="muted" style={{ marginLeft: 4 }}>
              Master courses are 1–3 month deep-dives. Skills carry over between courses.
            </Text>
          </View>
        )}
        {tab === 'explorer' && (
          <View style={styles.legend}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
            <Text variant="caption" tone="muted" style={{ marginLeft: 4 }}>
              Explorer workshops are 1–2 day sessions — great for trying something new.
            </Text>
          </View>
        )}

        {courses.map((course) => (
          <JourneyCard
            key={course.id}
            course={course}
            onPress={() => setSelected(course)}
          />
        ))}
      </ScrollView>

      <JourneyDetailPopup
        course={selected}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}

function JourneyCard({
  course,
  onPress,
}: {
  course: JourneyCourse;
  onPress: () => void;
}) {
  const isCurrent = course.status === 'current';
  const isDone    = course.status === 'completed';

  return (
    <Card
      style={[styles.card, isCurrent && styles.cardCurrent]}
      onPress={onPress}
    >
      {/* Title row */}
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text variant="h3">{course.title}</Text>
          <View style={styles.metaRow}>
            <Chip
              label={course.duration}
              style={{ marginRight: spacing.xs }}
            />
            {isCurrent && <Chip label="Enrolled" tone="warning" />}
            {isDone    && <Chip label="Completed" tone="success" />}
          </View>
        </View>
        {!isCurrent && !isDone && (
          <Text variant="bodyBold" style={styles.price}>
            ₹{course.price.toLocaleString('en-IN')}
          </Text>
        )}
      </View>

      {/* Key concepts preview */}
      <Text variant="small" tone="muted" style={{ marginTop: spacing.sm }}>
        {course.keyConcepts.slice(0, 3).join(' · ')}
        {course.keyConcepts.length > 3 ? ' · …' : ''}
      </Text>

      {course.dateAvailable && (
        <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
          Next available: {course.dateAvailable}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text variant="small" tone="secondary" style={{ fontWeight: '600' }}>
          {isCurrent ? 'View details' : isDone ? 'View journey' : 'Learn more'}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
      </View>
    </Card>
  );
}

function JourneyDetailPopup({
  course,
  onClose,
}: {
  course: JourneyCourse | null;
  onClose: () => void;
}) {
  if (!course) return null;
  const isCurrent = course.status === 'current';

  return (
    <Popup
      visible={!!course}
      title={course.title}
      onClose={onClose}
      fullHeight
    >
      {/* Example artwork placeholders */}
      <View style={styles.artworkGrid}>
        {[0, 1].map((i) => (
          <View key={i} style={styles.artworkTile}>
            <ImagePlaceholder aspectRatio={1} rounded="md" />
          </View>
        ))}
      </View>

      {/* Status chip + price */}
      <View style={styles.detailMeta}>
        <Chip label={course.duration} />
        {course.sessions && (
          <Text variant="caption" tone="muted" style={{ marginLeft: spacing.sm }}>
            {course.sessions} sessions
          </Text>
        )}
        {!isCurrent && (
          <Text variant="bodyBold" style={[styles.price, { marginLeft: 'auto' }]}>
            ₹{course.price.toLocaleString('en-IN')}
          </Text>
        )}
      </View>

      {/* Description */}
      <Text variant="body" tone="secondary" style={{ marginTop: spacing.md }}>
        {course.description}
      </Text>

      {/* Skills gained */}
      <Text variant="label" tone="muted" style={styles.sectionLabel}>
        Skills you'll build
      </Text>
      <View style={styles.skillChips}>
        {course.skillsGained.map((skill) => (
          <View
            key={skill}
            style={[styles.skillChip, { backgroundColor: `${SKILL_COLORS[skill]}18` }]}
          >
            <Ionicons
              name={SKILL_META[skill].icon as any}
              size={13}
              color={SKILL_COLORS[skill]}
            />
            <Text
              variant="caption"
              style={{ color: SKILL_COLORS[skill], fontWeight: '600', marginLeft: 4 }}
            >
              {SKILL_META[skill].name}
            </Text>
          </View>
        ))}
      </View>

      {/* Key concepts */}
      <Text variant="label" tone="muted" style={styles.sectionLabel}>
        What you'll cover
      </Text>
      {course.keyConcepts.map((concept) => (
        <View key={concept} style={styles.conceptRow}>
          <View style={styles.conceptDot} />
          <Text variant="small">{concept}</Text>
        </View>
      ))}

      {course.dateAvailable && (
        <Text variant="caption" tone="muted" style={{ marginTop: spacing.md }}>
          Next available: {course.dateAvailable}
        </Text>
      )}

      {/* CTA */}
      <View style={{ marginTop: spacing.xl }}>
        {isCurrent ? (
          <Button label="Go to my journey" variant="secondary" onPress={onClose} />
        ) : (
          <Button
            label={`Enroll · ₹${course.price.toLocaleString('en-IN')}`}
            onPress={onClose}
          />
        )}
      </View>
    </Popup>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  pageHeader: {
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
  tabs: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
  },

  // Cards
  card: {
    gap: 0,
  },
  cardCurrent: {
    borderColor: colors.warning,
    borderWidth: 1.5,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  price: {
    color: colors.textPrimary,
    flexShrink: 0,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  // Detail popup
  artworkGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  artworkTile: {
    flex: 1,
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  skillChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  conceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  conceptDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
});
