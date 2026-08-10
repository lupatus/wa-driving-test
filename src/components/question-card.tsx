import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Card, Pill, SectionHeading } from './ui';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { topicShortLabel } from '@/lib/questions';

import type { Question } from '@/lib/types';

interface Props {
  question: Question;
  selected: number | null;
  /** When false the options render neutrally — used while an exam is in progress. */
  revealAnswer: boolean;
  onSelect: (index: number) => void;
  /** e.g. "Question 3 of 40" */
  counter?: string;
}

export function QuestionCard({ question, selected, revealAnswer, onSelect, counter }: Props) {
  const c = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.metaRow}>
        <Pill tone="primary">{topicShortLabel(question.topic)}</Pill>
        <Pill
          tone={
            question.difficulty === 'easy'
              ? 'success'
              : question.difficulty === 'hard'
                ? 'danger'
                : 'warning'
          }>
          {question.difficulty}
        </Pill>
        {counter ? <Body muted style={styles.counter}>{counter}</Body> : null}
      </View>

      <SectionHeading>{question.question}</SectionHeading>

      <View style={styles.options}>
        {question.options.map((option, index) => (
          <OptionRow
            key={index}
            index={index}
            text={option}
            selected={selected === index}
            isCorrect={index === question.correctIndex}
            revealAnswer={revealAnswer}
            disabled={revealAnswer}
            onPress={() => onSelect(index)}
          />
        ))}
      </View>

      {revealAnswer ? (
        <Card style={[styles.explain, { backgroundColor: c.cardAlt }]}>
          <Text style={[styles.explainHeading, { color: c.text }]}>
            {selected === question.correctIndex ? '✅ Correct' : '❌ Not quite'}
          </Text>
          <Body>{question.explanation}</Body>
          <Text style={[styles.source, { color: c.textMuted }]}>{question.source}</Text>
        </Card>
      ) : null}
    </View>
  );
}

function OptionRow({
  index,
  text,
  selected,
  isCorrect,
  revealAnswer,
  disabled,
  onPress,
}: {
  index: number;
  text: string;
  selected: boolean;
  isCorrect: boolean;
  revealAnswer: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const c = useTheme();
  const letter = String.fromCharCode(65 + index);

  // Before the answer is revealed, only selection is signalled. After, the
  // correct row is always highlighted and a wrong pick is marked in red.
  let borderColor = c.border;
  let backgroundColor = c.card;
  let markColor = c.textSecondary;

  if (revealAnswer && isCorrect) {
    borderColor = c.success;
    backgroundColor = c.successSoft;
    markColor = c.success;
  } else if (revealAnswer && selected) {
    borderColor = c.danger;
    backgroundColor = c.dangerSoft;
    markColor = c.danger;
  } else if (selected) {
    borderColor = c.primary;
    backgroundColor = c.primarySoft;
    markColor = c.primarySoftText;
  }

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        { borderColor, backgroundColor, opacity: pressed && !disabled ? 0.85 : 1 },
      ]}>
      <View style={[styles.letterBadge, { borderColor: markColor }]}>
        <Text style={[styles.letter, { color: markColor }]}>{letter}</Text>
      </View>
      <Text style={[styles.optionText, { color: c.text }]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  counter: { marginLeft: 'auto', fontSize: 13 },
  options: { gap: Spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 56,
    borderWidth: 2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  letterBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontSize: 13, fontWeight: '700' },
  optionText: { flex: 1, fontSize: 15, lineHeight: 21 },
  explain: { gap: Spacing.xs },
  explainHeading: { fontSize: 15, fontWeight: '700' },
  source: { fontSize: 12, marginTop: Spacing.xs },
});
