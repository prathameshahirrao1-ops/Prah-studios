// Spec:
//   - docs/spec/schema/gk-carousel.md
//   - docs/spec/rules/loop-3-gk-quiz.md
//

import React, { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { colors, radius, spacing } from '../../theme';
import { GkCarousel } from '../../data/mockGkCarousel';

interface Props {
  carousel: GkCarousel;
  onClose: () => void;
  onComplete: () => void;
}

/**
 * Horizontal swipe carousel of 3 GK items. User swipes through — on reaching
 * the last slide, a "Done" button marks the daily GK complete (drives the
 * Daily streak).
 */
export function GkCarouselScreen({ carousel, onClose, onComplete }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const total = carousel.items.length;
  const isLast = index === total - 1;

  // Single source of truth: whatever the current scroll offset says.
  // Throttled `onScroll` keeps this in sync continuously, so button presses
  // and manual swipes can't get out of phase.
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const w = e.nativeEvent.layoutMeasurement.width || windowWidth;
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.max(0, Math.min(total - 1, Math.round(x / w)));
    if (next !== index) setIndex(next);
  };

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(total - 1, i));
    scrollRef.current?.scrollTo({ x: clamped * windowWidth, animated: true });
    // don't set index here — onScroll updates it as the scroll animates
  };

  const onDone = () => {
    onComplete();
    onClose();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          accessibilityLabel="Close"
          hitSlop={12}
        >
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted">
            Today's GK
          </Text>
          <Text variant="h3">
            {index + 1} of {total}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        {carousel.items.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSeg,
              i <= index && styles.progressSegActive,
            ]}
          />
        ))}
      </View>

      {/* Horizontal pager */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {carousel.items.map((item) => (
          <GkSlide key={item.id} item={item} width={windowWidth} />
        ))}
      </ScrollView>

      {/* Footer — prev/next/done */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => index > 0 && goTo(index - 1)}
          disabled={index === 0}
          style={[styles.arrowBtn, index === 0 && { opacity: 0.3 }]}
          accessibilityLabel="Previous"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>

        <View style={{ flex: 1, marginHorizontal: spacing.md }}>
          {isLast ? (
            <Button label="Mark done" size="sm" onPress={onDone} />
          ) : (
            <Button label="Next" size="sm" onPress={() => goTo(index + 1)} />
          )}
        </View>

        <Pressable
          onPress={() => !isLast && goTo(index + 1)}
          disabled={isLast}
          style={[styles.arrowBtn, isLast && { opacity: 0.3 }]}
          accessibilityLabel="Next"
          hitSlop={8}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function GkSlide({
  item,
  width,
}: {
  item: GkCarousel['items'][number];
  width: number;
}) {
  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={styles.slide}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.slideVisual}>
        <ImagePlaceholder
          aspectRatio={16 / 10}
          iconSize={36}
          style={{ borderRadius: 0, borderWidth: 0 }}
        />
      </View>
      <View style={styles.slideBody}>
        <Chip label={item.topic} tone="neutral" />
        <Text variant="h2" style={{ marginTop: spacing.md }}>
          {item.title}
        </Text>
        <Text variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
          {item.body}
        </Text>
      </View>
    </ScrollView>
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  progressSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressSegActive: {
    backgroundColor: colors.warning,
  },

  slide: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  slideVisual: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  slideBody: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
