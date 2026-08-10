import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { QuestionRunner } from '@/components/question-runner';
import { Body, Button, Screen, Title } from '@/components/ui';
import { TOPICS, getTopic, questionsForTopic, shuffle } from '@/lib/questions';

/** Prerenders a real page per topic in the static web export. */
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return TOPICS.map((t) => ({ topic: t.id }));
}

export default function StudyTopicScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const router = useRouter();

  const meta = getTopic(topic);
  // Shuffle once per mount so a repeat visit gives a different order.
  const questions = useMemo(() => shuffle(questionsForTopic(topic)), [topic]);

  if (!meta || questions.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Unknown topic' }} />
        <Title>Topic not found</Title>
        <Body muted>No questions are filed under “{topic}”.</Body>
        <Button label="Back to topics" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: meta.shortLabel }} />
      <QuestionRunner
        questions={questions}
        title={meta.label}
        doneLabel="Back to topics"
        onDone={() => router.back()}
      />
    </>
  );
}
