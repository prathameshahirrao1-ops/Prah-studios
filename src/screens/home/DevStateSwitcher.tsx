import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { colors, radius, spacing } from '../../theme';
import { HomeStateKey } from '../../data/homeState';
import {
  completeSession,
  nextUpcomingSession,
} from '../../data/mockSessions';
import {
  nextReviewableHw,
  nextSubmittableHw,
  reviewHomework,
  submitHomework,
  useHomeworkState,
} from '../../data/mockHomework';
import {
  nextReviewableSketchbook,
  reviewSketchbook,
  submitSketchbook,
  useSketchbookState,
} from '../../data/mockSketchbook';

/**
 * Dev-only chip at the top of Home — lets us demo all four home states
 * without waiting for real clock time. Will be removed before production.
 *
 * Loop 1 extension: "Complete next session" action simulates the server
 * flipping the next upcoming session to `completed`, crediting curriculum
 * skill points, and firing the post-class popup on next Home render.
 */
export function DevStateSwitcher({
  active,
  onPick,
}: {
  active: HomeStateKey | 'auto';
  onPick: (key: HomeStateKey | 'auto') => void;
}) {
  const [open, setOpen] = useState(false);

  const OPTIONS: { key: HomeStateKey | 'auto'; label: string }[] = [
    { key: 'auto', label: 'Real time' },
    { key: 'class_ongoing', label: 'Class ongoing' },
    { key: 'post_class', label: 'Post-class summary' },
    { key: 'hw_pending', label: 'Homework pending' },
    { key: 'enrolled_idle', label: 'Between classes' },
  ];

  // Subscribe to HW + Sketchbook stores so action labels/disabled states
  // update live as the student moves through each loop's state machine.
  useHomeworkState();
  useSketchbookState();

  const next = nextUpcomingSession();
  const canComplete = !!next;

  const submittable = nextSubmittableHw();
  const reviewable = nextReviewableHw();
  const sbReviewable = nextReviewableSketchbook();

  const onCompleteNext = () => {
    if (!next) return;
    completeSession(next.id);
    setOpen(false);
  };

  const onSubmitHw = () => {
    if (!submittable) return;
    submitHomework(submittable.id, '__mock_photo__');
    setOpen(false);
  };

  const onReviewHw = () => {
    if (!reviewable) return;
    reviewHomework(reviewable.id);
    setOpen(false);
  };

  const onSubmitSketchbook = () => {
    submitSketchbook({
      photoUri: '__mock_photo__',
      title: 'Dev sketch',
    });
    setOpen(false);
  };

  const onReviewSketchbook = () => {
    if (!sbReviewable) return;
    reviewSketchbook(sbReviewable.id);
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [styles.chip, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="flask-outline" size={14} color={colors.textPrimary} />
        <Text variant="small" style={{ fontWeight: '600', marginHorizontal: spacing.xs }}>
          Dev · {labelFor(active)}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.textMuted}
        />
      </Pressable>

      {open && (
        <View style={styles.menu}>
          {/* State presets */}
          <Text
            variant="caption"
            tone="muted"
            style={styles.menuHeader}
          >
            STATE
          </Text>
          {OPTIONS.map((o) => (
            <Pressable
              key={o.key}
              onPress={() => {
                onPick(o.key);
                setOpen(false);
              }}
              style={({ pressed }) => [
                styles.menuItem,
                o.key === active && styles.menuItemActive,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                variant="small"
                tone={o.key === active ? 'inverse' : 'primary'}
                style={{ fontWeight: o.key === active ? '600' : '400' }}
              >
                {o.label}
              </Text>
            </Pressable>
          ))}

          <View style={styles.divider} />

          {/* Simulation actions */}
          <Text
            variant="caption"
            tone="muted"
            style={styles.menuHeader}
          >
            SIMULATE
          </Text>
          <Pressable
            onPress={onCompleteNext}
            disabled={!canComplete}
            style={({ pressed }) => [
              styles.menuItem,
              !canComplete && { opacity: 0.45 },
              pressed && canComplete && { opacity: 0.8 },
            ]}
          >
            <View style={styles.actionRow}>
              <Ionicons
                name="play-forward-outline"
                size={14}
                color={colors.textPrimary}
              />
              <Text variant="small" style={{ marginLeft: spacing.xs }}>
                {canComplete
                  ? `Complete Session ${next!.sessionNumber}`
                  : 'No upcoming sessions'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={onSubmitHw}
            disabled={!submittable}
            style={({ pressed }) => [
              styles.menuItem,
              !submittable && { opacity: 0.45 },
              pressed && submittable && { opacity: 0.8 },
            ]}
          >
            <View style={styles.actionRow}>
              <Ionicons
                name="cloud-upload-outline"
                size={14}
                color={colors.textPrimary}
              />
              <Text variant="small" style={{ marginLeft: spacing.xs }}>
                {submittable
                  ? `Submit Session ${submittable.sessionNumber} HW`
                  : 'No HW to submit'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={onReviewHw}
            disabled={!reviewable}
            style={({ pressed }) => [
              styles.menuItem,
              !reviewable && { opacity: 0.45 },
              pressed && reviewable && { opacity: 0.8 },
            ]}
          >
            <View style={styles.actionRow}>
              <Ionicons
                name="ribbon-outline"
                size={14}
                color={colors.textPrimary}
              />
              <Text variant="small" style={{ marginLeft: spacing.xs }}>
                {reviewable
                  ? `Review Session ${reviewable.sessionNumber} HW`
                  : 'No HW to review'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={onSubmitSketchbook}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={styles.actionRow}>
              <Ionicons
                name="color-palette-outline"
                size={14}
                color={colors.textPrimary}
              />
              <Text variant="small" style={{ marginLeft: spacing.xs }}>
                Add Sketchbook piece
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={onReviewSketchbook}
            disabled={!sbReviewable}
            style={({ pressed }) => [
              styles.menuItem,
              !sbReviewable && { opacity: 0.45 },
              pressed && sbReviewable && { opacity: 0.8 },
            ]}
          >
            <View style={styles.actionRow}>
              <Ionicons
                name="sparkles-outline"
                size={14}
                color={colors.textPrimary}
              />
              <Text variant="small" style={{ marginLeft: spacing.xs }}>
                {sbReviewable
                  ? `Review Sketchbook: "${sbReviewable.title}"`
                  : 'No Sketchbook to review'}
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function labelFor(k: HomeStateKey | 'auto'): string {
  switch (k) {
    case 'auto': return 'Real time';
    case 'class_ongoing': return 'Class ongoing';
    case 'post_class': return 'Post-class';
    case 'hw_pending': return 'HW pending';
    case 'enrolled_idle': return 'Between classes';
  }
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    zIndex: 100,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    gap: 2,
  },
  menu: {
    position: 'absolute',
    top: 32,
    left: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    minWidth: 220,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  menuHeader: {
    letterSpacing: 0.6,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 2,
  },
  menuItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuItemActive: {
    backgroundColor: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
});
