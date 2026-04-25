import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, radius, spacing } from '../../theme';
import type { RootNavigatorParamList } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootNavigatorParamList, 'Welcome'>;

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}[] = [
  {
    icon: 'easel-outline',
    title: 'Art that grows with them',
    body: 'Live online classes with real teachers. Your child learns at their own pace, with a teacher who knows their name and nurtures their style.',
  },
  {
    icon: 'time-outline',
    title: 'Every session, captured',
    body: "A timeline of their journey — every class attended, every artwork submitted, every milestone they've crossed. All in one place.",
  },
  {
    icon: 'people-outline',
    title: 'A community of young artists',
    body: 'Your child creates alongside peers, shares their work, and draws inspiration from a studio full of young artists just like them.',
  },
];

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const scrollRef = useRef<ScrollView>(null);
  const [slide, setSlide] = useState(0);

  const isLast = slide === SLIDES.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (idx !== slide) setSlide(idx);
  };

  const goNext = () => {
    if (isLast) {
      navigation.navigate('SignIn');
      return;
    }
    const next = slide + 1;
    scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
    setSlide(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Dev skip */}
      <View style={styles.topRow}>
        <View />
        <Pressable onPress={() => navigation.navigate('MainApp')} hitSlop={12}>
          <Text variant="small" tone="muted">
            Dev: skip →
          </Text>
        </Pressable>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width: SCREEN_W }]}>
            <View style={styles.iconWrap}>
              <Ionicons name={s.icon} size={48} color={colors.textPrimary} />
            </View>
            <Text variant="h1" style={styles.slideTitle}>
              {s.title}
            </Text>
            <Text variant="body" tone="secondary" style={styles.slideBody}>
              {s.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
          ))}
        </View>
        <Button
          label={isLast ? 'Get started' : 'Next'}
          onPress={goNext}
          style={styles.cta}
        />
        <Pressable
          onPress={() => navigation.navigate('SignIn')}
          style={styles.signInRow}
          hitSlop={8}
        >
          <Text variant="small" tone="muted">
            Already enrolled?{' '}
            <Text variant="small" style={{ fontWeight: '700', color: colors.textPrimary }}>
              Sign in
            </Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  slide: {
    paddingHorizontal: spacing['3xl'],
    justifyContent: 'center',
    paddingBottom: spacing['5xl'],
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
  },
  slideTitle: {
    marginBottom: spacing.md,
  },
  slideBody: {
    lineHeight: 24,
  },
  bottom: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  cta: {
    alignSelf: 'stretch',
  },
  signInRow: {
    paddingVertical: spacing.xs,
  },
});
