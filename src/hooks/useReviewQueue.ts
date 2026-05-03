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
  total: number;
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
    total: cards.length,
    advance,
    incrementAgain,
  };
}
