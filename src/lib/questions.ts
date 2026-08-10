import rawQuestions from '../../data/question-bank.json';
import rawTopics from '../../data/topics.json';

import type { Question, RawQuestion, Topic, TopicId } from './types';

/**
 * Topic metadata recovered from the original app: `label` is the long
 * curriculum name used on list screens, `shortLabel` the badge form.
 * The array is in WA Driver Guide order.
 */
export const TOPICS = rawTopics as Topic[];

const BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

/** `licenses-001` -> `licenses`. The bank has no topic field; it never did. */
export function topicOf(questionId: string): TopicId {
  return questionId.replace(/-\d{3}$/, '') as TopicId;
}

export function topicLabel(topic: string): string {
  return BY_ID.get(topic as TopicId)?.label ?? topic;
}

export function topicShortLabel(topic: string): string {
  return BY_ID.get(topic as TopicId)?.shortLabel ?? topic;
}

export function getTopic(topic: string): Topic | undefined {
  return BY_ID.get(topic as TopicId);
}

export const QUESTIONS: Question[] = (rawQuestions as RawQuestion[]).map((q) => ({
  ...q,
  topic: topicOf(q.id),
}));

export const QUESTIONS_BY_ID: ReadonlyMap<string, Question> = new Map(
  QUESTIONS.map((q) => [q.id, q]),
);

export function questionsForTopic(topic: string): Question[] {
  return QUESTIONS.filter((q) => q.topic === topic);
}

export const TOTAL_QUESTIONS = QUESTIONS.length;

/** Fisher-Yates, non-mutating. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
