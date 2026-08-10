export type Difficulty = 'easy' | 'medium' | 'hard';

/** A record exactly as it appears in `data/question-bank.json`. */
export interface RawQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
  difficulty: Difficulty;
  tags: string[];
}

/** A question with its topic resolved from the id prefix. */
export interface Question extends RawQuestion {
  topic: TopicId;
}

export type TopicId =
  | 'signs-signals'
  | 'right-of-way'
  | 'sharing-road'
  | 'drivers'
  | 'markings-parking'
  | 'speed-space'
  | 'numbers'
  | 'conditions-emergencies'
  | 'vehicles'
  | 'licenses';

export interface Topic {
  id: TopicId;
  /** Long curriculum name, e.g. "Licenses & Permits". */
  label: string;
  /** Compact badge form, e.g. "Licenses". */
  shortLabel: string;
  /** WA Driver Guide sections this topic draws from. */
  guideSections: string[];
  questionCount: number;
  /** How many of this topic appear in a 40-question mock exam. */
  examQuestions: number;
}

/** Per-question running tally, keyed by question id. */
export interface QuestionStat {
  questionId: string;
  seen: number;
  correct: number;
  wrong: number;
  lastSeenAt: string;
}

/** Leitner scheduling state for one card, keyed by question id. */
export interface LeitnerCard {
  cardId: string;
  box: number;
  lastReviewedAt: string;
}

export interface Attempt {
  id: string;
  startedAt: string;
  finishedAt: string;
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
}

export interface Streak {
  current: number;
  longest: number;
  lastStudyDay: string;
}

export interface StudyState {
  version: number;
  attempts: Attempt[];
  questionStats: Record<string, QuestionStat>;
  leitnerState: Record<string, LeitnerCard>;
  streak: Streak;
}
