import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { QuestionCard } from '@/components/question-card';
import {
  Body,
  Button,
  Card,
  Checkbox,
  Pill,
  ProgressBar,
  Screen,
  SectionHeading,
  StatTile,
  Subtitle,
  Title,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { EXAM_CONFIG, buildExam, gradeExam, type ExamResult } from '@/lib/exam';
import { topicLabel } from '@/lib/questions';
import { useStudyStore } from '@/lib/store';

import type { Question } from '@/lib/types';

type Phase = 'idle' | 'taking' | 'results';

export default function TestScreen() {
  const router = useRouter();
  const c = useTheme();
  const { recordAnswer, recordAttempt } = useStudyStore();

  const [phase, setPhase] = useState<Phase>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState('');
  const [result, setResult] = useState<ExamResult | null>(null);

  /** Opt-in feedback during the exam; off by default, as in a real test. */
  const [checkAsYouGo, setCheckAsYouGo] = useState(false);
  /** Which questions the user has explicitly revealed via "Check now". */
  const [checked, setChecked] = useState<boolean[]>([]);

  const start = useCallback(() => {
    const exam = buildExam();
    setQuestions(exam);
    setAnswers(Array(exam.length).fill(null));
    setChecked(Array(exam.length).fill(false));
    setIndex(0);
    setStartedAt(new Date().toISOString());
    setResult(null);
    setPhase('taking');
  }, []);

  const select = useCallback(
    (choice: number) => {
      // Once revealed, the answer is locked in.
      if (checked[index]) return;
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = choice;
        return next;
      });
    },
    [index, checked],
  );

  const checkNow = useCallback(() => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, [index]);

  const submit = useCallback(() => {
    const graded = gradeExam(questions, answers);

    // Fold the exam into the per-question stats so Review and Progress see it.
    questions.forEach((q, i) => recordAnswer(q.id, answers[i] === q.correctIndex));
    recordAttempt({
      startedAt,
      finishedAt: new Date().toISOString(),
      correct: graded.correct,
      total: graded.total,
      percent: graded.percent,
      passed: graded.passed,
    });

    setResult(graded);
    setPhase('results');
  }, [questions, answers, startedAt, recordAnswer, recordAttempt]);

  if (phase === 'idle') {
    return (
      <Screen>
        <Title>Practice Test</Title>
        <Subtitle>
          {EXAM_CONFIG.TOTAL_QUESTIONS} questions drawn to match the real exam’s topic mix. You
          need {EXAM_CONFIG.PASSING_CORRECT} correct ({EXAM_CONFIG.PASSING_PERCENT}%) to pass.
        </Subtitle>
        <Card>
          <SectionHeading>How it works</SectionHeading>
          <Body muted>· Answers stay hidden until you submit.</Body>
          <Body muted>· You can move back and change any answer first.</Body>
          <Body muted>· Or tick “Check answers as I go” to reveal them one at a time.</Body>
          <Body muted>· Results break the score down by topic.</Body>
        </Card>
        <Button label="Start test" onPress={start} />
      </Screen>
    );
  }

  if (phase === 'taking') {
    const answered = answers.filter((a) => a !== null).length;
    const isLast = index === questions.length - 1;
    const revealed = checkAsYouGo && checked[index];
    const canCheck = checkAsYouGo && answers[index] !== null && !checked[index];
    const unanswered = questions.length - answered;

    return (
      <Screen>
        <View style={styles.rowBetween}>
          <Body muted>
            {answered} of {questions.length} answered
          </Body>
          {answered === questions.length ? <Pill tone="success">Ready to submit</Pill> : null}
        </View>
        <ProgressBar value={answered} max={questions.length} colorOverride={c.primary} />

        <Checkbox
          label="Check answers as I go"
          checked={checkAsYouGo}
          onToggle={() => setCheckAsYouGo((v) => !v)}
        />

        <QuestionCard
          question={questions[index]}
          selected={answers[index]}
          revealAnswer={revealed}
          onSelect={select}
          counter={`${index + 1} of ${questions.length}`}
        />

        {canCheck ? <Button label="Check now" variant="secondary" onPress={checkNow} /> : null}

        <View style={styles.navRow}>
          <Button
            label="Previous"
            variant="secondary"
            disabled={index === 0}
            onPress={() => setIndex((i) => i - 1)}
            style={styles.navButton}
          />
          <Button
            label={isLast ? 'Finish & submit' : 'Next'}
            onPress={isLast ? submit : () => setIndex((i) => i + 1)}
            style={styles.navButton}
          />
        </View>

        {!isLast ? (
          <Button
            label={unanswered > 0 ? `End test early (${unanswered} unanswered)` : 'End test early'}
            variant="ghost"
            onPress={submit}
          />
        ) : null}
      </Screen>
    );
  }

  if (!result) return null;

  return (
    <Screen>
      <Title>{result.passed ? '✅ Passed' : '❌ Not yet'}</Title>
      <Subtitle>
        Need {EXAM_CONFIG.PASSING_CORRECT} of {EXAM_CONFIG.TOTAL_QUESTIONS} to pass (
        {EXAM_CONFIG.PASSING_PERCENT}%).
      </Subtitle>

      <View style={styles.statRow}>
        <StatTile value={result.correct} label="Correct" />
        <StatTile value={result.total - result.correct} label="Missed" />
        <StatTile value={`${result.percent}%`} label="Score" />
      </View>

      <Card>
        <SectionHeading>Topic breakdown</SectionHeading>
        {Object.entries(result.byTopic)
          .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
          .map(([topic, score]) => (
            <View key={topic} style={styles.topicRow}>
              <Body>{topicLabel(topic)}</Body>
              <ProgressBar
                value={score.correct}
                max={score.total}
                label={`${score.correct}/${score.total}`}
              />
            </View>
          ))}
      </Card>

      <Button label="Retake test" onPress={start} />
      {result.missed.length > 0 ? (
        <Button
          label={`Review the ${result.missed.length} you missed`}
          variant="secondary"
          onPress={() => router.push('/review')}
        />
      ) : null}
      <Button label="Back to home" variant="ghost" onPress={() => router.push('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statRow: { flexDirection: 'row', gap: Spacing.sm },
  navRow: { flexDirection: 'row', gap: Spacing.sm },
  navButton: { flex: 1 },
  topicRow: { gap: Spacing.xs, marginTop: Spacing.sm },
});
