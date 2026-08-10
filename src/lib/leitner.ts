import type { LeitnerCard, QuestionStat } from './types';

/** Days a card waits in each box before it comes due again. */
export const LEITNER_INTERVAL_DAYS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
};

export const MAX_BOX = 5;
const DAY_MS = 86_400_000;

/**
 * Cards that have never been reviewed, or are in box 1, are always due.
 * Otherwise a card is due once its box interval has elapsed.
 */
export function getLeitnerDue(
  cardIds: string[],
  state: Record<string, LeitnerCard>,
): string[] {
  const now = Date.now();

  return cardIds.filter((id) => {
    const card = state[id];
    if (!card || card.box === 1) return true;

    const interval = LEITNER_INTERVAL_DAYS[card.box] ?? 0;
    const elapsedDays = (now - new Date(card.lastReviewedAt).getTime()) / DAY_MS;
    return elapsedDays >= interval;
  });
}

/** Correct promotes one box (capped at 5); wrong drops straight back to box 1. */
export function nextCard(current: LeitnerCard | undefined, correct: boolean): LeitnerCard {
  const box = current?.box ?? 1;
  return {
    cardId: current?.cardId ?? '',
    box: correct ? Math.min(box + 1, MAX_BOX) : 1,
    lastReviewedAt: new Date().toISOString(),
  };
}

/** Questions answered wrong more often than right — the review queue. */
export function getMissedQuestionIds(stats: Record<string, QuestionStat>): string[] {
  return Object.values(stats)
    .filter((s) => s.wrong > s.correct)
    .map((s) => s.questionId);
}

export function boxCounts(state: Record<string, LeitnerCard>): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const card of Object.values(state)) {
    counts[card.box] = (counts[card.box] ?? 0) + 1;
  }
  return counts;
}
