import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { nextCard } from './leitner';

import type { Attempt, LeitnerCard, QuestionStat, StudyState } from './types';

/** Same key the original web app used. */
const STORAGE_KEY = 'wa-driving-study';
const STATE_VERSION = 1;

function emptyState(): StudyState {
  return {
    version: STATE_VERSION,
    attempts: [],
    questionStats: {},
    leitnerState: {},
    streak: { current: 0, longest: 0, lastStudyDay: '' },
  };
}

/** Tolerates partial or older payloads rather than throwing them away. */
function reviveState(input: unknown): StudyState {
  const base = emptyState();
  if (!input || typeof input !== 'object') return base;
  const saved = input as Partial<StudyState>;

  return {
    version: STATE_VERSION,
    attempts: Array.isArray(saved.attempts) ? saved.attempts : base.attempts,
    questionStats:
      saved.questionStats && typeof saved.questionStats === 'object'
        ? saved.questionStats
        : base.questionStats,
    leitnerState:
      saved.leitnerState && typeof saved.leitnerState === 'object'
        ? saved.leitnerState
        : base.leitnerState,
    streak: saved.streak ?? base.streak,
  };
}

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

interface StudyStore {
  state: StudyState;
  hydrated: boolean;
  recordAnswer: (questionId: string, correct: boolean) => void;
  recordCardReview: (cardId: string, correct: boolean) => void;
  recordAttempt: (attempt: Omit<Attempt, 'id'>) => void;
  touchStreak: () => void;
  resetAll: () => void;
}

const StudyContext = createContext<StudyStore | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount.
  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (cancelled) return;
        if (saved) setState(reviveState(JSON.parse(saved)));
      })
      .catch(() => {
        // A corrupt or unreadable payload just means starting fresh.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on change, but never before hydration or we'd clobber saved data.
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }, 150);
  }, [state, hydrated]);

  const touchStreak = useCallback(() => {
    setState((prev) => {
      const today = dayKey();
      if (prev.streak.lastStudyDay === today) return prev;

      const yesterday = dayKey(new Date(Date.now() - 86_400_000));
      const current = prev.streak.lastStudyDay === yesterday ? prev.streak.current + 1 : 1;

      return {
        ...prev,
        streak: {
          current,
          longest: Math.max(current, prev.streak.longest),
          lastStudyDay: today,
        },
      };
    });
  }, []);

  const recordAnswer = useCallback(
    (questionId: string, correct: boolean) => {
      setState((prev) => {
        const existing: QuestionStat = prev.questionStats[questionId] ?? {
          questionId,
          seen: 0,
          correct: 0,
          wrong: 0,
          lastSeenAt: '',
        };

        const updated: QuestionStat = {
          questionId,
          seen: existing.seen + 1,
          correct: existing.correct + (correct ? 1 : 0),
          wrong: existing.wrong + (correct ? 0 : 1),
          lastSeenAt: new Date().toISOString(),
        };

        return { ...prev, questionStats: { ...prev.questionStats, [questionId]: updated } };
      });
      touchStreak();
    },
    [touchStreak],
  );

  const recordCardReview = useCallback(
    (cardId: string, correct: boolean) => {
      setState((prev) => {
        const current = prev.leitnerState[cardId];
        const updated: LeitnerCard = {
          ...nextCard(current ?? { cardId, box: 1, lastReviewedAt: '' }, correct),
          cardId,
        };
        return { ...prev, leitnerState: { ...prev.leitnerState, [cardId]: updated } };
      });
      touchStreak();
    },
    [touchStreak],
  );

  const recordAttempt = useCallback(
    (attempt: Omit<Attempt, 'id'>) => {
      setState((prev) => ({
        ...prev,
        attempts: [{ ...attempt, id: `${Date.now()}` }, ...prev.attempts].slice(0, 50),
      }));
      touchStreak();
    },
    [touchStreak],
  );

  const resetAll = useCallback(() => setState(emptyState()), []);

  const value = useMemo<StudyStore>(
    () => ({ state, hydrated, recordAnswer, recordCardReview, recordAttempt, touchStreak, resetAll }),
    [state, hydrated, recordAnswer, recordCardReview, recordAttempt, touchStreak, resetAll],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudyStore(): StudyStore {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudyStore must be used inside <StudyProvider>');
  return ctx;
}
