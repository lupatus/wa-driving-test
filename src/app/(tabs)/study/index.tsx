import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Body, Card, ProgressBar, Screen, SectionHeading, Subtitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TOPICS } from '@/lib/questions';
import { useStudyStore } from '@/lib/store';

/** Licenses alone spans 17 sections, so long lists get summarised. */
function guideSectionSummary(sections: string[]): string {
  if (sections.length === 0) return '';
  if (sections.length <= 5) return `Guide §${sections.join(', §')}`;
  return `Guide §${sections.slice(0, 4).join(', §')} +${sections.length - 4} more`;
}

export default function StudyIndexScreen() {
  const router = useRouter();
  const c = useTheme();
  const { state } = useStudyStore();

  /** Accuracy for one topic across every answer recorded against it. */
  function scoreFor(topicId: string) {
    let correct = 0;
    let total = 0;
    for (const s of Object.values(state.questionStats)) {
      if (s.questionId.replace(/-\d{3}$/, '') !== topicId) continue;
      correct += s.correct;
      total += s.seen;
    }
    return { correct, total };
  }

  return (
    <Screen>
      <Subtitle>
        Pick a topic to work through its questions with the answer and guide citation shown after
        each one.
      </Subtitle>

      {TOPICS.map((topic) => {
        const score = scoreFor(topic.id);

        return (
          <Pressable
            key={topic.id}
            accessibilityRole="button"
            onPress={() => router.push(`/study/${topic.id}`)}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <Card>
              <View style={styles.headerRow}>
                {/* Long labels must yield, or the count is pushed off-screen. */}
                <View style={styles.headerTitle}>
                  <SectionHeading>{topic.label}</SectionHeading>
                </View>
                <Body muted style={styles.headerCount}>
                  {topic.questionCount} questions
                </Body>
              </View>

              {score.total > 0 ? (
                <ProgressBar
                  label="Accuracy"
                  value={score.correct}
                  max={score.total}
                  showPercent
                />
              ) : (
                <Body muted>Not started</Body>
              )}

              <Body muted style={styles.sections}>
                {guideSectionSummary(topic.guideSections)}
              </Body>
            </Card>
          </Pressable>
        );
      })}

      <Body muted style={{ color: c.textMuted }}>
        {TOPICS.reduce((n, t) => n + t.questionCount, 0)} questions in total.
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  headerTitle: { flex: 1 },
  headerCount: { flexShrink: 0, fontSize: 13 },
  sections: { fontSize: 12 },
});
