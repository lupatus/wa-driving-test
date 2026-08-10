import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Body,
  Button,
  Card,
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
import { MAX_BOX, boxCounts, getMissedQuestionIds } from '@/lib/leitner';
import { TOPICS, TOTAL_QUESTIONS } from '@/lib/questions';
import { useStudyStore } from '@/lib/store';

export default function ProgressScreen() {
  const c = useTheme();
  const { state, resetAll } = useStudyStore();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const overall = useMemo(() => {
    const entries = Object.values(state.questionStats);
    const answered = entries.reduce((n, s) => n + s.seen, 0);
    const correct = entries.reduce((n, s) => n + s.correct, 0);
    return {
      seen: entries.length,
      answered,
      correct,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    };
  }, [state.questionStats]);

  const byTopic = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    for (const s of Object.values(state.questionStats)) {
      const topic = s.questionId.replace(/-\d{3}$/, '');
      const acc = map.get(topic) ?? { correct: 0, total: 0 };
      acc.correct += s.correct;
      acc.total += s.seen;
      map.set(topic, acc);
    }
    return map;
  }, [state.questionStats]);

  const boxes = boxCounts(state.leitnerState);
  const missed = getMissedQuestionIds(state.questionStats).length;

  return (
    <Screen>
      <View>
        <Title>Progress</Title>
        <Subtitle>Everything is stored on this device only.</Subtitle>
      </View>

      <View style={styles.statRow}>
        <StatTile value={`${overall.accuracy}%`} label="Overall accuracy" />
        <StatTile value={overall.answered} label="Answers given" />
        <StatTile value={state.streak.current} label="Day streak" />
      </View>

      <Card>
        <View style={styles.rowBetween}>
          <SectionHeading>Question coverage</SectionHeading>
          <Body muted>
            {overall.seen} / {TOTAL_QUESTIONS}
          </Body>
        </View>
        <ProgressBar value={overall.seen} max={TOTAL_QUESTIONS} showPercent />
        {missed > 0 ? (
          <Body muted>
            {missed} {missed === 1 ? 'question is' : 'questions are'} in the review queue.
          </Body>
        ) : null}
      </Card>

      <Card>
        <SectionHeading>By topic</SectionHeading>
        {TOPICS.map((topic) => {
          const score = byTopic.get(topic.id);
          return (
            <View key={topic.id} style={styles.topicRow}>
              <View style={styles.rowBetween}>
                <Body>{topic.shortLabel}</Body>
                <Body muted>
                  {score ? `${score.correct}/${score.total}` : `0/${topic.questionCount}`}
                </Body>
              </View>
              <ProgressBar
                value={score?.correct ?? 0}
                max={score?.total || topic.questionCount}
                colorOverride={score ? undefined : c.track}
              />
            </View>
          );
        })}
      </Card>

      <Card>
        <SectionHeading>Spaced repetition</SectionHeading>
        <Body muted>Cards move up a box each time you get them right.</Body>
        <View style={styles.boxRow}>
          {Array.from({ length: MAX_BOX }, (_, i) => i + 1).map((box) => (
            <StatTile key={box} value={boxes[box] ?? 0} label={`Box ${box}`} />
          ))}
        </View>
      </Card>

      <Card>
        <SectionHeading>Test history</SectionHeading>
        {state.attempts.length === 0 ? (
          <Body muted>No practice tests yet.</Body>
        ) : (
          state.attempts.slice(0, 10).map((attempt) => (
            <View key={attempt.id} style={styles.attemptRow}>
              <View>
                <Body>
                  {attempt.correct}/{attempt.total} · {attempt.percent}%
                </Body>
                <Body muted style={styles.attemptDate}>
                  {new Date(attempt.finishedAt).toLocaleString()}
                </Body>
              </View>
              <Pill tone={attempt.passed ? 'success' : 'danger'}>
                {attempt.passed ? 'Passed' : 'Failed'}
              </Pill>
            </View>
          ))
        )}
      </Card>

      <Card style={{ borderColor: c.danger }}>
        <SectionHeading>Reset</SectionHeading>
        {confirmingReset ? (
          <>
            <Body muted>
              This permanently deletes your test history, question stats, flashcard progress and
              streak. It cannot be undone.
            </Body>
            <View style={styles.navRow}>
              <Button
                label="Delete everything"
                variant="danger"
                style={styles.navButton}
                onPress={() => {
                  resetAll();
                  setConfirmingReset(false);
                }}
              />
              <Button
                label="Cancel"
                variant="secondary"
                style={styles.navButton}
                onPress={() => setConfirmingReset(false)}
              />
            </View>
          </>
        ) : (
          <Button
            label="Reset all progress"
            variant="danger"
            onPress={() => setConfirmingReset(true)}
          />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: Spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicRow: { gap: Spacing.xs, marginTop: Spacing.sm },
  boxRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm },
  attemptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  attemptDate: { fontSize: 12 },
  navRow: { flexDirection: 'row', gap: Spacing.sm },
  navButton: { flex: 1 },
});
