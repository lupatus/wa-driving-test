import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Pill, ProgressBar, Screen, Subtitle, Title } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FLASHCARDS, FLASHCARD_CATEGORIES, cardsForCategory } from '@/lib/flashcards';
import { LEITNER_INTERVAL_DAYS } from '@/lib/leitner';
import { shuffle } from '@/lib/questions';
import { useStudyStore } from '@/lib/store';

export default function FlashcardsScreen() {
  const c = useTheme();
  const { state, recordCardReview } = useStudyStore();

  const [category, setCategory] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const [nonce, setNonce] = useState(0);

  const deck = useMemo(
    () => shuffle(cardsForCategory(category)),
    // Re-shuffle when the filter changes or the user restarts.
    [category, nonce],
  );

  const card = deck[index];
  const done = index >= deck.length;

  const rate = useCallback(
    (knew: boolean) => {
      if (!card) return;
      recordCardReview(card.id, knew);
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [card, recordCardReview],
  );

  const restart = useCallback(() => {
    setIndex(0);
    setFlipped(false);
    setNonce((n) => n + 1);
  }, []);

  const pickCategory = useCallback((next: string | null) => {
    setCategory(next);
    setIndex(0);
    setFlipped(false);
  }, []);

  return (
    <Screen>
      <View>
        <Title>Numbers Flashcards</Title>
        <Subtitle>
          {FLASHCARDS.length} cards — tap to flip, then rate your confidence. Cards you miss come
          back sooner.
        </Subtitle>
      </View>

      <View style={styles.filterRow}>
        <FilterChip label="All" active={category === null} onPress={() => pickCategory(null)} />
        {FLASHCARD_CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            active={category === cat}
            onPress={() => pickCategory(cat)}
          />
        ))}
      </View>

      {done ? (
        <Card style={styles.doneCard}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Title>Deck finished</Title>
          <Body muted>
            You went through {deck.length} {deck.length === 1 ? 'card' : 'cards'}.
          </Body>
          <Button label="Shuffle and go again" onPress={restart} />
        </Card>
      ) : (
        <>
          <ProgressBar value={index} max={deck.length} label={`${index} of ${deck.length}`} />

          <Pressable
            accessibilityRole="button"
            accessibilityHint={flipped ? 'Show the question' : 'Reveal the answer'}
            onPress={() => setFlipped((f) => !f)}>
            <Card style={[styles.cardFace, { backgroundColor: flipped ? c.primarySoft : c.card }]}>
              <Pill tone="neutral">{card.category}</Pill>
              <Text style={[styles.faceText, { color: flipped ? c.primarySoftText : c.text }]}>
                {flipped ? card.back : card.front}
              </Text>
              <Body muted style={styles.hint}>
                {flipped ? card.source : 'Tap to reveal'}
              </Body>
            </Card>
          </Pressable>

          {flipped ? (
            <View style={styles.rateRow}>
              <Button
                label="Got it"
                onPress={() => rate(true)}
                style={styles.rateButton}
              />
              <Button
                label="Missed it"
                variant="danger"
                onPress={() => rate(false)}
                style={styles.rateButton}
              />
            </View>
          ) : (
            <Button label="Show answer" variant="secondary" onPress={() => setFlipped(true)} />
          )}
        </>
      )}

      <Card>
        <Body muted>
          Boxes advance on a correct answer and reset to 1 on a miss, resurfacing after{' '}
          {Object.values(LEITNER_INTERVAL_DAYS).slice(1).join(', ')} days.
        </Body>
        <Body muted>
          {Object.keys(state.leitnerState).length} cards and questions tracked so far.
        </Body>
      </Card>
    </Screen>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? c.primary : c.card,
          borderColor: active ? c.primary : c.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <Text style={[styles.chipText, { color: active ? c.primaryText : c.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  cardFace: { minHeight: 200, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  faceText: { fontSize: 22, fontWeight: '600', textAlign: 'center', lineHeight: 30 },
  hint: { fontSize: 12, textAlign: 'center' },
  rateRow: { flexDirection: 'row', gap: Spacing.sm },
  rateButton: { flex: 1 },
  doneCard: { alignItems: 'center', gap: Spacing.md },
  doneEmoji: { fontSize: 44 },
});
