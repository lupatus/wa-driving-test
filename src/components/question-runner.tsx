import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { QuestionCard } from './question-card';
import { Body, Button, Card, ProgressBar, Screen, SectionHeading, StatTile, Title } from './ui';

import { Spacing } from '@/constants/theme';
import { useStudyStore } from '@/lib/store';

import type { Question } from '@/lib/types';

interface Props {
  questions: Question[];
  /** Shown on the summary card once the set is finished. */
  title: string;
  onDone?: () => void;
  doneLabel?: string;
}

/**
 * Sequential practice with immediate feedback — shared by topic study and the
 * review queue. Each answer is recorded once, on first selection.
 */
export function QuestionRunner({ questions, title, onDone, doneLabel = 'Done' }: Props) {
  const { recordAnswer, recordCardReview } = useStudyStore();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, answered: 0 });

  const question = questions[index];
  const finished = index >= questions.length;

  const handleSelect = useCallback(
    (choice: number) => {
      if (selected !== null || !question) return;

      const correct = choice === question.correctIndex;
      setSelected(choice);
      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), answered: s.answered + 1 }));
      recordAnswer(question.id, correct);
      recordCardReview(question.id, correct);
    },
    [question, selected, recordAnswer, recordCardReview],
  );

  const next = useCallback(() => {
    setSelected(null);
    setIndex((i) => i + 1);
  }, []);

  const restart = useCallback(() => {
    setIndex(0);
    setSelected(null);
    setScore({ correct: 0, answered: 0 });
  }, []);

  if (finished) {
    const percent =
      score.answered > 0 ? Math.round((score.correct / score.answered) * 100) : 0;

    return (
      <Screen>
        <Title>{title} complete</Title>
        <View style={styles.statRow}>
          <StatTile value={score.correct} label="Correct" />
          <StatTile value={score.answered} label="Answered" />
          <StatTile value={`${percent}%`} label="Accuracy" />
        </View>
        <Card>
          <ProgressBar value={score.correct} max={score.answered || 1} showPercent />
          <Body muted>
            Anything you missed moves back to box 1 and will resurface in Review.
          </Body>
        </Card>
        <Button label="Go again" onPress={restart} />
        {onDone ? <Button label={doneLabel} variant="secondary" onPress={onDone} /> : null}
      </Screen>
    );
  }

  if (!question) {
    return (
      <Screen>
        <Title>Nothing to practise</Title>
        <Body muted>This set is empty.</Body>
        {onDone ? <Button label={doneLabel} variant="secondary" onPress={onDone} /> : null}
      </Screen>
    );
  }

  return (
    <Screen>
      <ProgressBar value={index} max={questions.length} />

      <QuestionCard
        question={question}
        selected={selected}
        revealAnswer={selected !== null}
        onSelect={handleSelect}
        counter={`${index + 1} of ${questions.length}`}
      />

      <Button
        label={index === questions.length - 1 ? 'Finish' : 'Next question'}
        disabled={selected === null}
        onPress={next}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: Spacing.sm },
});
