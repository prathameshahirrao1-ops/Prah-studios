// Spec:
//   - docs/spec/schema/quiz.md
//   - docs/spec/rules/loop-3-gk-quiz.md
//

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { colors, radius, spacing } from '../../theme';
import { Quiz, QuizOption, QuizQuestion } from '../../data/mockQuizzes';
import { SKILL_META, SkillType } from '../../data/mockSkills';

interface Props {
  quiz: Quiz;
  onClose: () => void;
  /**
   * Fired when user taps "Done" on the result screen. Receives the
   * student's answers so the caller can credit points (Loop 3).
   */
  onComplete: (answers: Record<string, string>) => void;
}

/**
 * 3-question visual-compare quiz. One attempt. Explanation after each answer.
 * Result screen shows score + per-skill points earned.
 */
export function QuizScreen({ quiz, onClose, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<'picking' | 'answered'>('picking');
  const [showResult, setShowResult] = useState(false);

  const question = quiz.questions[index];
  const selectedOptionId = answers[question.id];
  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect === true;
  const total = quiz.questions.length;

  const onPickOption = (optionId: string) => {
    if (phase === 'answered') return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    setPhase('answered');
  };

  const onNext = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setPhase('picking');
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <ResultView
        quiz={quiz}
        answers={answers}
        onClose={() => {
          onComplete(answers);
          onClose();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          style={styles.closeHeaderBtn}
          accessibilityLabel="Close quiz"
          hitSlop={12}
        >
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted">
            Session {quiz.sessionNumber} quiz
          </Text>
          <Text variant="h3">
            Question {index + 1} of {total}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        {quiz.questions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSeg,
              i <= index && styles.progressSegActive,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.questionCard}>
          <Text variant="caption" tone="muted" style={{ marginBottom: 4 }}>
            Tests {SKILL_META[question.skill].name}
          </Text>
          <Text variant="h2">{question.text}</Text>
        </View>

        {/* Options */}
        {question.options.map((option) => {
          const picked = selectedOptionId === option.id;
          const showStateBorder = phase === 'answered';
          const isWinner = option.isCorrect;
          return (
            <Pressable
              key={option.id}
              onPress={() => onPickOption(option.id)}
              disabled={phase === 'answered'}
              style={({ pressed }) => [
                styles.optionCard,
                showStateBorder && picked && isWinner && styles.optionCorrect,
                showStateBorder && picked && !isWinner && styles.optionWrong,
                showStateBorder && !picked && isWinner && styles.optionReveal,
                pressed && phase === 'picking' && { opacity: 0.85 },
              ]}
            >
              <View style={styles.optionThumb}>
                <ImagePlaceholder
                  aspectRatio={1}
                  iconSize={36}
                  style={{ borderWidth: 0, backgroundColor: colors.surfaceAlt }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold">{option.label}</Text>
                {showStateBorder && picked && (
                  <Text
                    variant="small"
                    style={{
                      marginTop: 2,
                      fontWeight: '600',
                      color: isWinner ? colors.success : colors.error,
                    }}
                  >
                    {isWinner ? 'Your answer · correct' : 'Your answer'}
                  </Text>
                )}
                {showStateBorder && !picked && isWinner && (
                  <Text
                    variant="small"
                    style={{
                      marginTop: 2,
                      fontWeight: '600',
                      color: colors.success,
                    }}
                  >
                    Correct answer
                  </Text>
                )}
              </View>
              {showStateBorder && picked && (
                <Ionicons
                  name={isWinner ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={isWinner ? colors.success : colors.error}
                />
              )}
              {showStateBorder && !picked && isWinner && (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color={colors.success}
                />
              )}
            </Pressable>
          );
        })}

        {/* Explanation */}
        {phase === 'answered' && (
          <View style={styles.explanationCard}>
            <Text
              variant="bodyBold"
              style={{
                color: isCorrect ? colors.success : colors.warning,
                marginBottom: 4,
              }}
            >
              {isCorrect ? 'Nice — that\'s right.' : 'Not quite.'}
            </Text>
            <Text variant="small" tone="secondary">
              {question.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      {phase === 'answered' && (
        <View style={styles.footer}>
          <Button
            label={index + 1 < total ? 'Next question' : 'See results'}
            onPress={onNext}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function ResultView({
  quiz,
  answers,
  onClose,
}: {
  quiz: Quiz;
  answers: Record<string, string>;
  onClose: () => void;
}) {
  const correctCount = quiz.questions.filter((q) => {
    const a = answers[q.id];
    return q.options.find((o) => o.id === a)?.isCorrect === true;
  }).length;
  const total = quiz.questions.length;

  // Keep in sync with creditQuizCompletion in mockQuizzes.ts: +2 pts per
  // correct answer, credited to that question's skill.
  const pointsBySkill: Partial<Record<SkillType, number>> = {};
  for (const q of quiz.questions) {
    const a = answers[q.id];
    const correct = q.options.find((o) => o.id === a)?.isCorrect === true;
    if (correct) {
      pointsBySkill[q.skill] = (pointsBySkill[q.skill] ?? 0) + 2;
    }
  }
  const skillsEarned = Object.keys(pointsBySkill) as SkillType[];

  const headline =
    correctCount === total
      ? 'Perfect.'
      : correctCount >= Math.ceil(total / 2)
      ? 'Well done.'
      : 'Good try.';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted">
            Session {quiz.sessionNumber} quiz
          </Text>
          <Text variant="h3">Results</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.resultHero}>
          <Text variant="numberLg">
            {correctCount}/{total}
          </Text>
          <Text
            variant="display"
            style={{ fontSize: 24, lineHeight: 28, marginTop: spacing.xs }}
          >
            {headline}
          </Text>
          <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
            {correctCount === total
              ? 'Every answer correct.'
              : `${correctCount} out of ${total} correct.`}
          </Text>
        </View>

        {skillsEarned.length > 0 ? (
          <View style={styles.card}>
            <Text variant="label" tone="muted" style={{ marginBottom: spacing.sm }}>
              Skill points earned
            </Text>
            {skillsEarned.map((skill) => (
              <View key={skill} style={styles.skillRow}>
                <Text variant="body">{SKILL_META[skill].name}</Text>
                <View style={styles.gainPill}>
                  <Text
                    variant="caption"
                    style={{ fontWeight: '700', color: colors.warning }}
                  >
                    +{pointsBySkill[skill]}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text variant="body" tone="muted" style={{ textAlign: 'center' }}>
              No skill points this time. Try the next quiz when it unlocks.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Done" onPress={onClose} />
      </View>
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
  closeHeaderBtn: {
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
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },

  questionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: 'rgba(47, 158, 106, 0.06)',
  },
  optionWrong: {
    borderColor: colors.error,
    backgroundColor: 'rgba(217, 69, 63, 0.06)',
  },
  optionReveal: {
    borderColor: colors.success,
  },
  optionThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    overflow: 'hidden',
  },

  explanationCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },

  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },

  resultHero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  gainPill: {
    minWidth: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(209, 141, 30, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
