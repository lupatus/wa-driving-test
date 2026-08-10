import rawCards from '../../data/flashcards.json';

/**
 * The "Numbers to Know" deck — a dataset separate from the question bank,
 * recovered from the original page payload.
 */
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  source: string;
}

export const FLASHCARDS = rawCards as Flashcard[];

/** Deck order, as authored. */
export const FLASHCARD_CATEGORIES: string[] = FLASHCARDS.reduce<string[]>((acc, card) => {
  if (!acc.includes(card.category)) acc.push(card.category);
  return acc;
}, []);

export function cardsForCategory(category: string | null): Flashcard[] {
  return category ? FLASHCARDS.filter((c) => c.category === category) : FLASHCARDS;
}
