import { useRouter } from 'expo-router';
import { useMemo } from 'react';
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
  SupportLink,
  Title,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { EXAM_CONFIG } from '@/lib/exam';
import { getMissedQuestionIds } from '@/lib/leitner';
import { TOPICS, TOTAL_QUESTIONS, topicLabel } from '@/lib/questions';
import { useStudyStore } from '@/lib/store';

export default function DashboardScreen() {
  const router = useRouter();
  const { state } = useStudyStore();

  const stats = useMemo(() => {
    const entries = Object.values(state.questionStats);
    const seen = entries.length;
    const answered = entries.reduce((n, s) => n + s.seen, 0);
    const correct = entries.reduce((n, s) => n + s.correct, 0);
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const best = state.attempts.reduce((max, a) => Math.max(max, a.percent), 0);
    return { seen, answered, accuracy, best };
  }, [state.questionStats, state.attempts]);

  const missedCount = getMissedQuestionIds(state.questionStats).length;

  // Weakest topics by accuracy, only counting topics actually attempted.
  const focusAreas = useMemo(() => {
    const byTopic = new Map<string, { correct: number; total: number }>();
    for (const s of Object.values(state.questionStats)) {
      const topic = s.questionId.replace(/-\d{3}$/, '');
      const acc = byTopic.get(topic) ?? { correct: 0, total: 0 };
      acc.correct += s.correct;
      acc.total += s.seen;
      byTopic.set(topic, acc);
    }
    return [...byTopic.entries()]
      .filter(([, v]) => v.total > 0)
      .map(([topic, v]) => ({ topic, rate: v.correct / v.total }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 3);
  }, [state.questionStats]);

  return (
    <Screen>
      <View>
        <Title>WA Driving Test Study</Title>
        <Subtitle>
          {TOTAL_QUESTIONS} questions across {TOPICS.length} topics from the Washington State
          Driver Guide.
        </Subtitle>
      </View>

      <View style={styles.statRow}>
        <StatTile value={stats.seen} label="Questions seen" />
        <StatTile value={`${stats.accuracy}%`} label="Accuracy" />
        <StatTile value={state.streak.current} label="Day streak" />
      </View>

      <Card>
        <View style={styles.rowBetween}>
          <SectionHeading>Coverage</SectionHeading>
          <Body muted>
            {stats.seen} / {TOTAL_QUESTIONS}
          </Body>
        </View>
        <ProgressBar value={stats.seen} max={TOTAL_QUESTIONS} showPercent />
        {state.attempts.length > 0 ? (
          <Body muted>
            Best mock exam: {stats.best}% · {state.attempts.length}{' '}
            {state.attempts.length === 1 ? 'attempt' : 'attempts'}
          </Body>
        ) : (
          <Body muted>
            Pass mark is {EXAM_CONFIG.PASSING_CORRECT} of {EXAM_CONFIG.TOTAL_QUESTIONS} (
            {EXAM_CONFIG.PASSING_PERCENT}%).
          </Body>
        )}
      </Card>

      {focusAreas.length > 0 ? (
        <Card>
          <SectionHeading>Focus areas</SectionHeading>
          <View style={styles.pillRow}>
            {focusAreas.map(({ topic, rate }) => (
              <Pill key={topic} tone={rate >= 0.8 ? 'success' : 'warning'}>
                {`${topicLabel(topic)} · ${Math.round(rate * 100)}%`}
              </Pill>
            ))}
          </View>
          <Body muted>Tap Study to drill the topics you are weakest on.</Body>
        </Card>
      ) : null}

      <View style={styles.actions}>
        <Button label="📝 Take Practice Test" onPress={() => router.push('/test')} />
        <Button
          label="📚 Study by Topic"
          variant="secondary"
          onPress={() => router.push('/study')}
        />
        <Button
          label="🃏 Numbers Flashcards"
          variant="secondary"
          onPress={() => router.push('/flashcards')}
        />
        <Button
          label={missedCount > 0 ? `🔄 Review Missed (${missedCount})` : '🔄 Review Missed'}
          variant="secondary"
          disabled={missedCount === 0}
          onPress={() => router.push('/review')}
        />
      </View>

      <SupportLink />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: Spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actions: { gap: Spacing.md, marginTop: Spacing.xs },
});
