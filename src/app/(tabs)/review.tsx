// src/app/(tabs)/review.tsx
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import { useReviewQueue } from '../../hooks/useReviewQueue';
import { useProgressStore } from '../../stores/useProgressStore';
import { FlipCard } from '../../components/review/FlipCard';
import { SRSRatingBar } from '../../components/review/SRSRatingBar';
import { ReviewComplete } from '../../components/review/ReviewComplete';
import { formatInterval } from '../../services/srs';
import type { SrsRating } from '../../services/srs';
import type { Character } from '../../types/character';

export default function ReviewScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isLoading, isDone, hasStudied, nextReviewDate, currentCard, reviewed, againCount, advance, incrementAgain } =
    useReviewQueue();
  const { recordReviewRated } = useProgressStore();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = useCallback(() => setIsFlipped(true), []);

  const handleRate = useCallback(
    async (rating: SrsRating) => {
      if (!currentCard) return;
      if (rating === 'again') incrementAgain();
      await recordReviewRated(currentCard.id, rating);
      setIsFlipped(false);
      advance();
    },
    [currentCard, recordReviewRated, advance, incrementAgain],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.empty, { color: colors.textMuted }]}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (isDone && reviewed === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyBox}>
          {!hasStudied ? (
            <>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing to review yet</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Study some characters in the Learn tab first.
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>You're all caught up!</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                {nextReviewDate
                  ? `Next review: ${formatInterval(
                      Math.max(
                        0,
                        Math.ceil(
                          (new Date(nextReviewDate).getTime() - Date.now()) / 86400000,
                        ),
                      ),
                    )}`
                  : 'No upcoming reviews scheduled.'}
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (isDone) {
    return (
      <ReviewComplete
        reviewed={reviewed}
        againCount={againCount}
        onDone={() => router.replace('/(tabs)/learn')}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.counter, { color: colors.textSecondary }]}>
          {reviewed + 1} of {reviewed + 1 + (currentCard ? 1 : 0)}
        </Text>
      </View>

      <View style={styles.cardArea}>
        <FlipCard
          key={currentCard?.id}
          front={<CardFront card={currentCard!} colors={colors} />}
          back={<CardBack card={currentCard!} colors={colors} />}
          onFlip={handleFlip}
        />
      </View>

      <View style={styles.ratingArea}>
        {isFlipped ? (
          <SRSRatingBar onRate={handleRate} />
        ) : (
          <Text style={[styles.hint, { color: colors.textMuted }]}>Tap card to reveal</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function CardFront({ card, colors }: { card: Character; colors: any }) {
  return (
    <View style={[cardStyles.face, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[cardStyles.char, { color: colors.text }]}>{card.character}</Text>
      <Text style={[cardStyles.strokeCount, { color: colors.textMuted }]}>
        {card.strokeCount} strokes
      </Text>
    </View>
  );
}

function CardBack({ card, colors }: { card: Character; colors: any }) {
  return (
    <View style={[cardStyles.face, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[cardStyles.charSm, { color: colors.text }]}>{card.character}</Text>
      <Text style={[cardStyles.pinyin, { color: colors.textSecondary }]}>{card.pinyin}</Text>
      <Text style={[cardStyles.keyword, { color: colors.text }]}>{card.keyword}</Text>
      <Text style={[cardStyles.definition, { color: colors.textSecondary }]} numberOfLines={2}>
        {card.definition}
      </Text>
      {card.examples.length > 0 && (
        <Text style={[cardStyles.examples, { color: colors.textMuted }]}>
          {card.examples.slice(0, 3).join('  •  ')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  counter: { fontSize: fontSize.caption },
  cardArea: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  ratingArea: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, minHeight: 60, justifyContent: 'center' },
  hint: { textAlign: 'center', fontSize: fontSize.body },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxxl, gap: spacing.md },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, textAlign: 'center' },
  emptySub: { fontSize: fontSize.body, textAlign: 'center' },
  empty: { flex: 1, textAlign: 'center', textAlignVertical: 'center' },
});

const cardStyles = StyleSheet.create({
  face: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 280,
    justifyContent: 'center',
  },
  char: { fontSize: 80, fontWeight: fontWeight.black },
  charSm: { fontSize: 56, fontWeight: fontWeight.black },
  pinyin: { fontSize: fontSize.lg },
  keyword: { fontSize: fontSize.heading, fontWeight: fontWeight.bold },
  definition: { fontSize: fontSize.body, textAlign: 'center' },
  strokeCount: { fontSize: fontSize.caption },
  examples: { fontSize: fontSize.caption, textAlign: 'center' },
});
