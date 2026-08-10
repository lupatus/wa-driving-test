import { QUESTIONS, TOPICS, shuffle, topicOf } from './questions';

import type { Question, TopicId } from './types';

/** Recovered from the original bundle: 40 questions, pass at 32 (80%). */
export const EXAM_CONFIG = {
  TOTAL_QUESTIONS: 40,
  PASSING_CORRECT: 32,
  PASSING_PERCENT: 80,
} as const;

/** Per-topic quotas for a mock exam. Sums to EXAM_CONFIG.TOTAL_QUESTIONS. */
export const EXAM_BLUEPRINT: Record<TopicId, number> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t.examQuestions]),
) as Record<TopicId, number>;

/**
 * Draw a mock exam that matches the blueprint's topic mix, then shuffle so the
 * topics are interleaved rather than grouped.
 */
export function buildExam(pool: Question[] = QUESTIONS): Question[] {
  const picked: Question[] = [];

  for (const [topic, quota] of Object.entries(EXAM_BLUEPRINT) as [TopicId, number][]) {
    const candidates = shuffle(pool.filter((q) => q.topic === topic));
    picked.push(...candidates.slice(0, quota));
  }

  // If a topic ran short, top up from whatever is left so the count still lands
  // on TOTAL_QUESTIONS.
  if (picked.length < EXAM_CONFIG.TOTAL_QUESTIONS) {
    const chosen = new Set(picked.map((q) => q.id));
    const filler = shuffle(pool.filter((q) => !chosen.has(q.id)));
    picked.push(...filler.slice(0, EXAM_CONFIG.TOTAL_QUESTIONS - picked.length));
  }

  return shuffle(picked).slice(0, EXAM_CONFIG.TOTAL_QUESTIONS);
}

export interface TopicScore {
  correct: number;
  total: number;
}

export interface ExamResult {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  byTopic: Record<string, TopicScore>;
  missed: Question[];
}

/** `answers[i]` is the selected option index for `questions[i]`, or null. */
export function gradeExam(questions: Question[], answers: (number | null)[]): ExamResult {
  const byTopic: Record<string, TopicScore> = {};
  const missed: Question[] = [];
  let correct = 0;

  questions.forEach((question, i) => {
    const topic = topicOf(question.id);
    byTopic[topic] ??= { correct: 0, total: 0 };
    byTopic[topic].total++;

    if (answers[i] === question.correctIndex) {
      correct++;
      byTopic[topic].correct++;
    } else {
      missed.push(question);
    }
  });

  const total = questions.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    correct,
    total,
    percent,
    passed: correct >= EXAM_CONFIG.PASSING_CORRECT,
    byTopic,
    missed,
  };
}
