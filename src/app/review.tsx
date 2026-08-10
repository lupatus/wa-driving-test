import { useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';

import { QuestionRunner } from '@/components/question-runner';
import { Body, Button, EmptyState, Screen, Title } from '@/components/ui';
import { getLeitnerDue, getMissedQuestionIds } from '@/lib/leitner';
import { QUESTIONS_BY_ID, shuffle } from '@/lib/questions';
import { useStudyStore } from '@/lib/store';

import type { Question } from '@/lib/types';

export default function ReviewScreen() {
  const router = useRouter();
  const { state, hydrated } = useStudyStore();

  // Snapshot the queue on first render. Recomputing as answers land would pull
  // questions out from under the runner mid-session.
  const queueRef = useRef<Question[] | null>(null);

  const queue = useMemo(() => {
    if (!hydrated) return null;
    if (queueRef.current) return queueRef.current;

    const missed = getMissedQuestionIds(state.questionStats);
    const due = new Set(getLeitnerDue(missed, state.leitnerState));
    const questions = missed
      .filter((id) => due.has(id))
      .map((id) => QUESTIONS_BY_ID.get(id))
      .filter((q): q is Question => q !== undefined);

    queueRef.current = shuffle(questions);
    return queueRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!queue) {
    return (
      <Screen>
        <Title>Review</Title>
        <Body muted>Loading your queue…</Body>
      </Screen>
    );
  }

  if (queue.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Nothing due"
          message="Questions you get wrong more often than right land here, once their spaced-repetition interval is up."
        />
        <Button label="Back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <QuestionRunner
      questions={queue}
      title="Review"
      doneLabel="Back"
      onDone={() => router.back()}
    />
  );
}
