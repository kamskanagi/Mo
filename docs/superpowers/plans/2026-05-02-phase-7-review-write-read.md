# Phase 7 — Review, Write, Read Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three stub tabs (Review, Write, Read) with fully functional implementations — Anki-style SRS flashcard review, HanziWriter stroke-order practice, and animated chat-bubble conversation reading.

**Architecture:** Built sequentially: Review first (SRS service already exists), Write second (HanziWriter for stroke data + validation), Read last (conversation data already exists). Each tab is self-contained; no shared new infrastructure.

**Tech Stack:** React Native, Expo Router, expo-sqlite, react-native-reanimated (already installed), react-native-hanzi-writer (new), react-native-svg (already installed), Zustand, existing srs.ts / useSpeech / useProgressStore.

---

## File Map

**New files:**
- `src/hooks/useReviewQueue.ts`
- `src/components/review/FlipCard.tsx`
- `src/components/review/SRSRatingBar.tsx`
- `src/components/review/ReviewComplete.tsx`
- `src/hooks/useReadCompletion.ts`
- `src/components/read/ChatBubble.tsx`
- `src/components/read/ReadingControls.tsx`
- `src/components/read/ConversationView.tsx`
- `src/components/write/HanziPracticeCard.tsx`
- `src/components/write/WriteComplete.tsx`

**Modified files:**
- `src/services/srs.ts` — add `SrsRating` type + `calculateNextReviewRated`
- `src/services/__tests__/srs.test.ts` — add tests for `calculateNextReviewRated`
- `src/stores/useProgressStore.ts` — add `recordReviewRated` action
- `src/db/queries.ts` — add `hasStudiedCards` + `getNextReviewDate`
- `src/app/(tabs)/review.tsx` — replace stub
- `src/app/(tabs)/write.tsx` — replace stub
- `src/app/(tabs)/read.tsx` — replace stub

---

## Task 1: Add 4-rating SRS to srs.ts

**Files:**
- Modify: `src/services/srs.ts`
- Test: `src/services/__tests__/srs.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `src/services/__tests__/srs.test.ts`:

```typescript
import {
  calculateNextReview,
  calculateNextReviewRated,
  formatInterval,
  isDueToday,
} from '../srs';

// ... existing tests unchanged ...

describe('calculateNextReviewRated', () => {
  const base = { currentInterval: 7, currentFactor: 2.5, correctCount: 4 };

  it('again resets interval to 1 and decreases factor by 0.2', () => {
    const r = calculateNextReviewRated(base, 'again');
    expect(r.srsInterval).toBe(1);
    expect(r.srsFactor).toBe(2.3);
    expect(r.status).toBe('learning');
  });

  it('hard multiplies interval by 1.2 and decreases factor by 0.15', () => {
    const r = calculateNextReviewRated(base, 'hard');
    expect(r.srsInterval).toBe(Math.round(7 * 1.2));
    expect(r.srsFactor).toBe(2.35);
    expect(r.status).toBe('learning');
  });

  it('good follows normal SM-2 progression', () => {
    const r = calculateNextReviewRated(base, 'good');
    expect(r.srsInterval).toBe(Math.round(7 * (2.5 + 0.05)));
    expect(r.status).toBe('reviewing');
  });

  it('easy multiplies interval by factor * 1.3', () => {
    const r = calculateNextReviewRated(base, 'easy');
    expect(r.srsInterval).toBe(Math.round(7 * (2.5 + 0.15) * 1.3));
    expect(r.status).toBe('reviewing');
  });

  it('again on first card (interval=0) sets interval to 1', () => {
    const r = calculateNextReviewRated({ ...base, currentInterval: 0 }, 'again');
    expect(r.srsInterval).toBe(1);
  });

  it('easy on first card (interval=0) skips to interval 3', () => {
    const r = calculateNextReviewRated({ ...base, currentInterval: 0 }, 'easy');
    expect(r.srsInterval).toBe(3);
  });

  it('factor never drops below 1.3', () => {
    const r = calculateNextReviewRated({ ...base, currentFactor: 1.3 }, 'again');
    expect(r.srsFactor).toBe(1.3);
  });

  it('interval is capped at 365', () => {
    const r = calculateNextReviewRated({ ...base, currentInterval: 300 }, 'easy');
    expect(r.srsInterval).toBeLessThanOrEqual(365);
  });

  it('nextReview is a valid YYYY-MM-DD date', () => {
    const r = calculateNextReviewRated(base, 'good');
    expect(r.nextReview).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest src/services/__tests__/srs.test.ts --no-coverage
```

Expected: `calculateNextReviewRated is not a function` or similar import error.

- [ ] **Step 3: Add `SrsRating` type and `calculateNextReviewRated` to srs.ts**

Append to the bottom of `src/services/srs.ts` (after `isDueToday`):

```typescript
export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

/**
 * Calculate next review using Anki-style 4-button rating.
 *
 * @param input - Current SRS state (without wasCorrect)
 * @param rating - User's self-rating: again | hard | good | easy
 */
export function calculateNextReviewRated(
  input: Omit<SrsInput, 'wasCorrect'>,
  rating: SrsRating
): SrsUpdate {
  const { currentInterval, currentFactor } = input;
  let newInterval: number;
  let newFactor: number;

  switch (rating) {
    case 'again':
      newInterval = 1;
      newFactor = Math.max(1.3, currentFactor - 0.2);
      break;
    case 'hard':
      newFactor = Math.max(1.3, currentFactor - 0.15);
      newInterval = currentInterval === 0 ? 1 : Math.max(1, Math.round(currentInterval * 1.2));
      break;
    case 'good':
      newFactor = Math.max(1.3, currentFactor + 0.05);
      if (currentInterval === 0) newInterval = 1;
      else if (currentInterval === 1) newInterval = 3;
      else if (currentInterval === 3) newInterval = 7;
      else newInterval = Math.round(currentInterval * newFactor);
      break;
    case 'easy':
      newFactor = Math.min(4.0, currentFactor + 0.15);
      newInterval = currentInterval === 0 ? 3 : Math.round(currentInterval * newFactor * 1.3);
      break;
  }

  newInterval = Math.min(newInterval!, 365);

  const status: 'learning' | 'reviewing' | 'mastered' =
    rating === 'again' ? 'learning'
    : newInterval < 7 ? 'learning'
    : newInterval >= 90 ? 'mastered'
    : 'reviewing';

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    srsInterval: newInterval,
    srsFactor: Math.round(newFactor! * 100) / 100,
    nextReview: nextDate.toISOString().slice(0, 10),
    status,
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest src/services/__tests__/srs.test.ts --no-coverage
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/srs.ts src/services/__tests__/srs.test.ts
git commit -m "feat: add 4-rating SRS function (calculateNextReviewRated)"
```

---

## Task 2: Add `recordReviewRated` to useProgressStore

**Files:**
- Modify: `src/stores/useProgressStore.ts`

- [ ] **Step 1: Add import and action signature**

In `src/stores/useProgressStore.ts`, add to the imports at the top:

```typescript
import { calculateNextReview, calculateNextReviewRated } from '../services/srs';
import type { SrsRating } from '../services/srs';
```

(Replace the existing `import { calculateNextReview } from '../services/srs';` line.)

- [ ] **Step 2: Add `recordReviewRated` to the `ProgressActions` interface**

Add after `recordReview`:

```typescript
recordReviewRated: (characterId: number, rating: SrsRating) => Promise<void>;
```

- [ ] **Step 3: Implement `recordReviewRated` in the store**

Add after the `recordReview` implementation inside `create(...)`:

```typescript
recordReviewRated: async (characterId: number, rating: SrsRating) => {
  const existing = await getProgress(characterId);
  const next = calculateNextReviewRated(
    {
      currentInterval: existing?.srsInterval ?? 0,
      currentFactor: existing?.srsFactor ?? 2.5,
      correctCount: existing?.correctCount ?? 0,
    },
    rating,
  );
  await updateProgress(characterId, {
    status: next.status,
    srsInterval: next.srsInterval,
    srsFactor: next.srsFactor,
    nextReview: next.nextReview,
    lastReviewed: new Date().toISOString().slice(0, 10),
    correctCount: (existing?.correctCount ?? 0) + (rating !== 'again' ? 1 : 0),
    mistakeCount: (existing?.mistakeCount ?? 0) + (rating === 'again' ? 1 : 0),
  });
  await incrementTodayStat('reviews_completed');
  await get().refreshStats();
},
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/stores/useProgressStore.ts
git commit -m "feat: add recordReviewRated action to useProgressStore"
```

---

## Task 3: Add DB helpers for Review empty states

**Files:**
- Modify: `src/db/queries.ts`

- [ ] **Step 1: Append two functions to queries.ts**

Add at the end of `src/db/queries.ts`:

```typescript
// ─── Review Helpers ──────────────────────────────────────────

/**
 * Returns true if the user has at least one card that is not 'new'.
 * Used to distinguish "nothing studied yet" from "nothing due today".
 */
export async function hasStudiedCards(): Promise<boolean> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM user_progress
     WHERE status IN ('seen', 'learning', 'reviewing', 'mastered')`
  );
  return (row?.count ?? 0) > 0;
}

/**
 * Returns the earliest upcoming review date, or null if no cards are scheduled.
 */
export async function getNextReviewDate(): Promise<string | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ next_review: string }>(
    `SELECT next_review FROM user_progress
     WHERE status IN ('learning', 'reviewing') AND next_review IS NOT NULL
     ORDER BY next_review ASC LIMIT 1`
  );
  return row?.next_review ?? null;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/db/queries.ts
git commit -m "feat: add hasStudiedCards and getNextReviewDate queries"
```

---

## Task 4: Build `useReviewQueue` hook

**Files:**
- Create: `src/hooks/useReviewQueue.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/useReviewQueue.ts
import { useState, useEffect, useCallback } from 'react';
import { getDueReviews, hasStudiedCards, getNextReviewDate } from '../db/queries';
import type { Character } from '../types/character';

export interface ReviewSession {
  isLoading: boolean;
  isDone: boolean;
  hasStudied: boolean;
  nextReviewDate: string | null;
  currentCard: Character | null;
  reviewed: number;
  againCount: number;
  advance: () => void;
  incrementAgain: () => void;
}

export function useReviewQueue(limit = 50): ReviewSession {
  const [cards, setCards] = useState<Character[]>([]);
  const [index, setIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [againCount, setAgainCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStudied, setHasStudied] = useState(false);
  const [nextReviewDate, setNextReviewDate] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [due, studied, nextDate] = await Promise.all([
        getDueReviews(limit),
        hasStudiedCards(),
        getNextReviewDate(),
      ]);
      setCards(due);
      setHasStudied(studied);
      setNextReviewDate(nextDate);
      setIsLoading(false);
    })();
  }, [limit]);

  const advance = useCallback(() => {
    setIndex((i) => i + 1);
    setReviewed((r) => r + 1);
  }, []);

  const incrementAgain = useCallback(() => {
    setAgainCount((c) => c + 1);
  }, []);

  return {
    isLoading,
    isDone: !isLoading && index >= cards.length,
    hasStudied,
    nextReviewDate,
    currentCard: cards[index] ?? null,
    reviewed,
    againCount,
    advance,
    incrementAgain,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useReviewQueue.ts
git commit -m "feat: add useReviewQueue hook"
```

---

## Task 5: Build `FlipCard` component

**Files:**
- Create: `src/components/review/FlipCard.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/review/FlipCard.tsx
import { useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  onFlip?: () => void;
}

export function FlipCard({ front, back, onFlip }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(rotation.value, [0, 1], [180, 360])}deg` },
    ],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  const handleFlip = useCallback(() => {
    if (flipped) return;
    rotation.value = withTiming(1, { duration: 350 });
    setFlipped(true);
    onFlip?.();
  }, [flipped, onFlip, rotation]);

  return (
    <TouchableOpacity onPress={handleFlip} activeOpacity={1} style={styles.container}>
      <View style={styles.inner}>
        <Animated.View style={[styles.face, frontStyle]}>{front}</Animated.View>
        <Animated.View style={[styles.face, backStyle]}>{back}</Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  inner: { position: 'relative', width: '100%' },
  face: { width: '100%' },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/review/FlipCard.tsx
git commit -m "feat: add FlipCard component with reanimated 3D flip"
```

---

## Task 6: Build `SRSRatingBar` component

**Files:**
- Create: `src/components/review/SRSRatingBar.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/review/SRSRatingBar.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import type { SrsRating } from '../../services/srs';

interface SRSRatingBarProps {
  onRate: (rating: SrsRating) => void;
}

const RATINGS: Array<{ label: string; rating: SrsRating; bg: string; fg: string }> = [
  { label: 'Again', rating: 'again', bg: '#7f1d1d', fg: '#fca5a5' },
  { label: 'Hard',  rating: 'hard',  bg: '#78350f', fg: '#fcd34d' },
  { label: 'Good',  rating: 'good',  bg: '#14532d', fg: '#86efac' },
  { label: 'Easy',  rating: 'easy',  bg: '#1e3a5f', fg: '#93c5fd' },
];

export function SRSRatingBar({ onRate }: SRSRatingBarProps) {
  return (
    <View style={styles.row}>
      {RATINGS.map(({ label, rating, bg, fg }) => (
        <TouchableOpacity
          key={rating}
          style={[styles.btn, { backgroundColor: bg }]}
          onPress={() => onRate(rating)}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/review/SRSRatingBar.tsx
git commit -m "feat: add SRSRatingBar component"
```

---

## Task 7: Build `ReviewComplete` component

**Files:**
- Create: `src/components/review/ReviewComplete.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/review/ReviewComplete.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

interface ReviewCompleteProps {
  reviewed: number;
  againCount: number;
  onDone: () => void;
}

export function ReviewComplete({ reviewed, againCount, onDone }: ReviewCompleteProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.icon}>✓</Text>
      <Text style={[styles.title, { color: colors.text }]}>All caught up!</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.value, { color: colors.green }]}>{reviewed}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>reviewed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.value, { color: colors.red }]}>{againCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>again</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onDone}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, { color: colors.textSecondary }]}>Back to Learn</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  icon: { fontSize: 48 },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.black },
  stats: { flexDirection: 'row', gap: spacing.xxxl },
  stat: { alignItems: 'center', gap: spacing.xs },
  value: { fontSize: 32, fontWeight: fontWeight.black },
  statLabel: { fontSize: fontSize.caption },
  btn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  btnText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/review/ReviewComplete.tsx
git commit -m "feat: add ReviewComplete component"
```

---

## Task 8: Wire `ReviewScreen`

**Files:**
- Modify: `src/app/(tabs)/review.tsx`

- [ ] **Step 1: Replace the stub with the full screen**

```typescript
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
    // No cards were due when the session started
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
      {/* Progress bar */}
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
      <Text style={[cardStyles.pinyin, { color: colors.textSecondary }]}>
        {card.pinyin}
      </Text>
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(tabs)/review.tsx"
git commit -m "feat: implement Review tab with Anki-style SRS flashcards"
```

---

## Task 9: Install `react-native-hanzi-writer`

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install the package**

```bash
npm install react-native-hanzi-writer
```

- [ ] **Step 2: Verify install and check the exported types**

```bash
cat node_modules/react-native-hanzi-writer/index.d.ts 2>/dev/null || cat node_modules/react-native-hanzi-writer/dist/index.d.ts 2>/dev/null | head -80
```

Note the exact prop names for `character`, `width`, `height`, `quiz` config, and the `onComplete` callback shape — use these in Task 10.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install react-native-hanzi-writer"
```

---

## Task 10: Build `HanziPracticeCard` component

**Files:**
- Create: `src/components/write/HanziPracticeCard.tsx`

- [ ] **Step 1: Verify the library's imperative API**

```bash
grep -r "ref\|animateStroke\|showHint\|animateCurrentStroke" node_modules/react-native-hanzi-writer/dist/index.d.ts 2>/dev/null | head -20
```

Note the method names for animating/hinting the current stroke — you'll use them in the "Show me" button below. Common names: `animateCurrentStroke()`, `showNextStroke()`, or `hint()`.

- [ ] **Step 2: Create the component**

> Verify prop names match the types from Task 9 Step 2. Adjust `strokeColor`/`outlineColor`/`highlightColor` if the library uses different names.  
> Replace `writerRef.current.animateCurrentStroke()` with the actual method name you found in Step 1.

```typescript
// src/components/write/HanziPracticeCard.tsx
import { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import HanziWriter from 'react-native-hanzi-writer';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import type { Character } from '../../types/character';

interface HanziPracticeCardProps {
  character: Character;
  onComplete: (mistakes: number) => void;
  onSkip: () => void;
}

export function HanziPracticeCard({ character, onComplete, onSkip }: HanziPracticeCardProps) {
  const { colors } = useTheme();
  const mistakesRef = useRef(0);
  const writerRef = useRef<any>(null);

  const handleMistake = useCallback(() => {
    mistakesRef.current += 1;
  }, []);

  const handleComplete = useCallback(() => {
    onComplete(mistakesRef.current);
  }, [onComplete]);

  const handleShowMe = useCallback(() => {
    // Calls the library's imperative method to animate the current stroke.
    // Replace 'animateCurrentStroke' with the actual method from the library types.
    writerRef.current?.animateCurrentStroke?.();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.keyword, { color: colors.text }]}>
        {character.keyword}
        <Text style={[styles.pinyin, { color: colors.textSecondary }]}>
          {'  '}{character.pinyin}
        </Text>
      </Text>

      <View style={[styles.canvas, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <HanziWriter
          ref={writerRef}
          character={character.character}
          width={220}
          height={220}
          padding={10}
          showOutline
          strokeColor={colors.characterStroke}
          outlineColor={colors.characterOutline}
          highlightColor={colors.characterHighlight}
          quiz={{
            onMistake: handleMistake,
            onCorrectStroke: undefined,
            onComplete: handleComplete,
            showHintAfterMisses: 3,
            highlightOnComplete: true,
          }}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.ctrlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleShowMe}
          activeOpacity={0.8}
        >
          <Text style={[styles.ctrlText, { color: colors.textSecondary }]}>▶ Show me</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctrlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onSkip}
          activeOpacity={0.8}
        >
          <Text style={[styles.ctrlText, { color: colors.textMuted }]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.lg },
  keyword: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  pinyin: { fontSize: fontSize.body, fontWeight: fontWeight.regular },
  canvas: { borderRadius: radius.xl, borderWidth: 1, overflow: 'hidden' },
  controls: { flexDirection: 'row', gap: spacing.md },
  ctrlBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  ctrlText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. If prop names differ from actual types, fix them now.

- [ ] **Step 4: Commit**

```bash
git add src/components/write/HanziPracticeCard.tsx
git commit -m "feat: add HanziPracticeCard component with Show me and Skip"
```

---

## Task 11: Build `WriteComplete` component

**Files:**
- Create: `src/components/write/WriteComplete.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/write/WriteComplete.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

interface WriteCompleteProps {
  totalCharacters: number;
  totalMistakes: number;
  onDone: () => void;
}

export function WriteComplete({ totalCharacters, totalMistakes, onDone }: WriteCompleteProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.icon}>✍️</Text>
      <Text style={[styles.title, { color: colors.text }]}>Practice complete!</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.value, { color: colors.teal }]}>{totalCharacters}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>characters</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.value, { color: totalMistakes === 0 ? colors.green : colors.gold }]}>
            {totalMistakes}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>mistakes</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onDone}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, { color: colors.textSecondary }]}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  icon: { fontSize: 48 },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.black },
  stats: { flexDirection: 'row', gap: spacing.xxxl },
  stat: { alignItems: 'center', gap: spacing.xs },
  value: { fontSize: 32, fontWeight: fontWeight.black },
  statLabel: { fontSize: fontSize.caption },
  btn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  btnText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/write/WriteComplete.tsx
git commit -m "feat: add WriteComplete component"
```

---

## Task 12: Wire `WriteScreen`

**Files:**
- Modify: `src/app/(tabs)/write.tsx`

- [ ] **Step 1: Replace the stub with the full screen**

```typescript
// src/app/(tabs)/write.tsx
import { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import { useAppStore } from '../../stores/useAppStore';
import { useProgressStore } from '../../stores/useProgressStore';
import { getCharactersByWeek } from '../../db/queries';
import { HanziPracticeCard } from '../../components/write/HanziPracticeCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { WriteComplete } from '../../components/write/WriteComplete';
import type { Character } from '../../types/character';

export default function WriteScreen() {
  const { colors } = useTheme();
  const { currentWeek } = useAppStore();
  const { recordWritingPractice } = useProgressStore();

  const [chars, setChars] = useState<Character[]>([]);
  const [index, setIndex] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCharactersByWeek(currentWeek || 1).then((result) => {
      setChars(result);
      setIsLoading(false);
    });
  }, [currentWeek]);

  const handleComplete = useCallback(
    async (mistakes: number) => {
      const char = chars[index];
      if (char) {
        await recordWritingPractice(char.id, mistakes);
      }
      setTotalMistakes((t) => t + mistakes);

      if (index + 1 >= chars.length) {
        setIsDone(true);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [chars, index, recordWritingPractice],
  );

  // Skip: count all remaining strokes as mistakes
  const handleSkip = useCallback(() => {
    const char = chars[index];
    handleComplete(char?.strokeCount ?? 10);
  }, [chars, index, handleComplete]);

  const handleRestart = useCallback(() => {
    setIndex(0);
    setTotalMistakes(0);
    setIsDone(false);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted }]}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (chars.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted }]}>No characters for this week.</Text>
      </SafeAreaView>
    );
  }

  if (isDone) {
    return (
      <WriteComplete
        totalCharacters={chars.length}
        totalMistakes={totalMistakes}
        onDone={handleRestart}
      />
    );
  }

  const current = chars[index];
  const progress = index / chars.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Write</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Week {currentWeek} · {index + 1} of {chars.length}
        </Text>
      </View>

      <View style={styles.progress}>
        <ProgressBar progress={progress} color={colors.teal} />
      </View>

      <View style={styles.body}>
        <HanziPracticeCard
          key={current.id}
          character={current}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.xs },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.black },
  subtitle: { fontSize: fontSize.caption },
  progress: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  loading: { flex: 1, textAlign: 'center', textAlignVertical: 'center' },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(tabs)/write.tsx"
git commit -m "feat: implement Write tab with HanziWriter stroke-order practice"
```

---

## Task 13: Build `useReadCompletion` hook

**Files:**
- Create: `src/hooks/useReadCompletion.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/useReadCompletion.ts
//
// Tracks which conversations the user has completed.
// Uses raw settings keys: conv_done_<week> = 'true'
import { useState, useCallback } from 'react';
import { getSetting, setSetting } from '../db/queries';

const key = (week: number) => `conv_done_${week}`;

export function useReadCompletion(weeks: number[]) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const values = await Promise.all(weeks.map((w) => getSetting(key(w))));
    const done = new Set<number>();
    weeks.forEach((w, i) => { if (values[i] === 'true') done.add(w); });
    setCompleted(done);
    setLoaded(true);
  }, [weeks.join(',')]);

  const markDone = useCallback(async (week: number) => {
    await setSetting(key(week), 'true');
    setCompleted((prev) => new Set(prev).add(week));
  }, []);

  return { completed, loaded, load, markDone };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useReadCompletion.ts
git commit -m "feat: add useReadCompletion hook"
```

---

## Task 14: Build `ChatBubble` and `ReadingControls`

**Files:**
- Create: `src/components/read/ChatBubble.tsx`
- Create: `src/components/read/ReadingControls.tsx`

- [ ] **Step 1: Create `ChatBubble`**

```typescript
// src/components/read/ChatBubble.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize } from '../../theme/typography';
import { useSpeech } from '../../hooks/useSpeech';
import type { ConversationLine } from '../../types/progress';

interface ChatBubbleProps {
  line: ConversationLine;
  showPinyin: boolean;
  showEnglish: boolean;
  index: number;
}

export function ChatBubble({ line, showPinyin, showEnglish, index }: ChatBubbleProps) {
  const { colors } = useTheme();
  const { speakText, speaking } = useSpeech('zh-TW');
  const isA = line.speaker === 'A';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(300)}
      style={[styles.row, isA ? styles.rowLeft : styles.rowRight]}
    >
      <View
        style={[
          styles.bubble,
          { backgroundColor: isA ? colors.surface : colors.blueSoft },
          isA ? styles.bubbleLeft : styles.bubbleRight,
        ]}
      >
        <Text style={[styles.chinese, { color: colors.text }]}>{line.chinese}</Text>
        {showPinyin && (
          <Text style={[styles.pinyin, { color: colors.textMuted }]}>{line.pinyin}</Text>
        )}
        {showEnglish && (
          <Text style={[styles.english, { color: colors.textSecondary }]}>{line.english}</Text>
        )}
        <TouchableOpacity onPress={() => speakText(line.chinese)} style={styles.ttsBtn}>
          <Text style={{ color: speaking ? colors.teal : colors.textMuted, fontSize: 14 }}>
            {speaking ? '🔊' : '🔈'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', marginBottom: spacing.md },
  rowLeft: { alignItems: 'flex-start' },
  rowRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    padding: spacing.base,
    gap: spacing.xs,
  },
  bubbleLeft: { borderRadius: radius.lg, borderTopLeftRadius: 2 },
  bubbleRight: { borderRadius: radius.lg, borderTopRightRadius: 2 },
  chinese: { fontSize: fontSize.lg },
  pinyin: { fontSize: fontSize.sm },
  english: { fontSize: fontSize.caption, fontStyle: 'italic' },
  ttsBtn: { alignSelf: 'flex-end', marginTop: spacing.xs },
});
```

- [ ] **Step 2: Create `ReadingControls`**

```typescript
// src/components/read/ReadingControls.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

interface ReadingControlsProps {
  showPinyin: boolean;
  showEnglish: boolean;
  onTogglePinyin: () => void;
  onToggleEnglish: () => void;
}

export function ReadingControls({
  showPinyin,
  showEnglish,
  onTogglePinyin,
  onToggleEnglish,
}: ReadingControlsProps) {
  const { colors } = useTheme();

  const Toggle = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.toggle, { backgroundColor: active ? colors.tealSoft : colors.surface, borderColor: active ? colors.teal : colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.toggleText, { color: active ? colors.teal : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.row}>
      <Toggle label="拼音" active={showPinyin} onPress={onTogglePinyin} />
      <Toggle label="EN" active={showEnglish} onPress={onToggleEnglish} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  toggleText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/components/read/ChatBubble.tsx src/components/read/ReadingControls.tsx
git commit -m "feat: add ChatBubble and ReadingControls components"
```

---

## Task 15: Build `ConversationView`

**Files:**
- Create: `src/components/read/ConversationView.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/read/ConversationView.tsx
import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import { ChatBubble } from './ChatBubble';
import { ReadingControls } from './ReadingControls';
import type { Conversation } from '../../types/progress';

interface ConversationViewProps {
  conversation: Conversation;
  onComplete: () => void;
  onBack: () => void;
}

export function ConversationView({ conversation, onComplete, onBack }: ConversationViewProps) {
  const { colors } = useTheme();
  const [revealed, setRevealed] = useState(1);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const [done, setDone] = useState(false);

  const handleTap = useCallback(() => {
    if (done) return;
    if (revealed >= conversation.lines.length) {
      setDone(true);
    } else {
      setRevealed((r) => r + 1);
    }
  }, [revealed, done, conversation.lines.length]);

  const [titleChinese, titleEnglish] = conversation.title.split(' — ');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={[styles.back, { color: colors.teal }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text style={[styles.titleCn, { color: colors.text }]}>{titleChinese}</Text>
          {titleEnglish && (
            <Text style={[styles.titleEn, { color: colors.textSecondary }]}>{titleEnglish}</Text>
          )}
        </View>
        <ReadingControls
          showPinyin={showPinyin}
          showEnglish={showEnglish}
          onTogglePinyin={() => setShowPinyin((v) => !v)}
          onToggleEnglish={() => setShowEnglish((v) => !v)}
        />
      </View>

      {/* Chat bubbles */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {conversation.lines.slice(0, revealed).map((line, i) => (
          <ChatBubble
            key={i}
            line={line}
            index={i}
            showPinyin={showPinyin}
            showEnglish={showEnglish}
          />
        ))}
      </ScrollView>

      {/* Tap target / complete button */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {done ? (
          <TouchableOpacity
            style={[styles.completeBtn, { backgroundColor: colors.teal }]}
            onPress={onComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.completeBtnText}>Complete ✓</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.tapBtn} onPress={handleTap} activeOpacity={0.7}>
            <Text style={[styles.tapHint, { color: colors.textMuted }]}>
              {revealed < conversation.lines.length ? 'Tap to continue →' : 'Tap to finish'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  backBtn: { paddingRight: spacing.sm },
  back: { fontSize: fontSize.body },
  titleBox: { flex: 1 },
  titleCn: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
  titleEn: { fontSize: fontSize.caption },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  footer: { borderTopWidth: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  tapBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  tapHint: { fontSize: fontSize.body },
  completeBtn: {
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  completeBtnText: { color: '#fff', fontSize: fontSize.body, fontWeight: fontWeight.bold },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/read/ConversationView.tsx
git commit -m "feat: add ConversationView component"
```

---

## Task 16: Wire `ReadScreen`

**Files:**
- Modify: `src/app/(tabs)/read.tsx`

- [ ] **Step 1: Replace the stub with the full screen**

```typescript
// src/app/(tabs)/read.tsx
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';
import { useAppStore } from '../../stores/useAppStore';
import { useReadCompletion } from '../../hooks/useReadCompletion';
import { ConversationView } from '../../components/read/ConversationView';
import { CONVERSATIONS } from '../../data/conversations';
import type { Conversation } from '../../types/progress';

const ALL_WEEKS = CONVERSATIONS.map((c) => c.week);

export default function ReadScreen() {
  const { colors } = useTheme();
  const { currentWeek } = useAppStore();
  const { completed, loaded, load, markDone } = useReadCompletion(ALL_WEEKS);
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async () => {
    if (!selected) return;
    await markDone(selected.week);
    setSelected(null);
  };

  if (selected) {
    return (
      <ConversationView
        conversation={selected}
        onComplete={handleComplete}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Read</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {CONVERSATIONS.filter((c) => completed.has(c.week)).length} of {CONVERSATIONS.length} complete
          </Text>
        </View>

        <View style={styles.list}>
          {CONVERSATIONS.map((conv) => {
            const unlocked = conv.week <= currentWeek;
            const done = completed.has(conv.week);
            const [titleCn, titleEn] = conv.title.split(' — ');

            return (
              <TouchableOpacity
                key={conv.week}
                style={[
                  styles.item,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: unlocked ? 1 : 0.45,
                  },
                ]}
                onPress={() => unlocked && setSelected(conv)}
                activeOpacity={unlocked ? 0.7 : 1}
                disabled={!unlocked}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemCn, { color: colors.text }]}>{titleCn}</Text>
                  <Text style={[styles.itemEn, { color: colors.textSecondary }]}>
                    {titleEn}  ·  Week {conv.week}
                  </Text>
                </View>
                {unlocked ? (
                  <View style={[styles.badge, { backgroundColor: done ? colors.greenSoft : colors.blueSoft }]}>
                    <Text style={[styles.badgeText, { color: done ? colors.green : colors.blue }]}>
                      {done ? 'Done' : 'New'}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>🔒</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.xs },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.black },
  subtitle: { fontSize: fontSize.caption },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginTop: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  itemInfo: { flex: 1, gap: spacing.xxs },
  itemCn: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  itemEn: { fontSize: fontSize.caption },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeText: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold },
  bottomPad: { height: spacing.xxxl },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run the full test suite**

```bash
npm test -- --no-coverage
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(tabs)/read.tsx"
git commit -m "feat: implement Read tab with graded conversation reading"
```

---

## Task 17: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npm test -- --no-coverage
```

Expected: all tests pass.

- [ ] **Step 2: TypeScript clean compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit summary**

```bash
git log --oneline -10
```

Verify the last ~12 commits cover all tasks in sequence.

- [ ] **Step 4: Push**

```bash
git push --set-upstream origin main
```
