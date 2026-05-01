import { create } from 'zustand';
import {
  getWeekProgress,
  getOverallProgress,
  getDailyStreak,
  getTodayStats,
  updateProgress,
  incrementTodayStat,
  getProgress,
} from '../db/queries';
import { calculateNextReview } from '../services/srs';
import type { WeekProgress, OverallProgress, DailyStats } from '../types/progress';

interface ProgressState {
  weekProgress: Map<number, WeekProgress>;
  overallProgress: OverallProgress;
  streak: number;
  todayStats: DailyStats;
}

interface ProgressActions {
  loadProgress: () => Promise<void>;
  markCharacterStudied: (characterId: number) => Promise<void>;
  recordReview: (characterId: number, wasCorrect: boolean) => Promise<void>;
  recordWritingPractice: (characterId: number, mistakes: number) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const emptyOverall: OverallProgress = {
  total: 3183,
  new: 3183,
  seen: 0,
  learning: 0,
  reviewing: 0,
  mastered: 0,
};

const emptyStats: DailyStats = {
  date: new Date().toISOString().slice(0, 10),
  newCharactersStudied: 0,
  reviewsCompleted: 0,
  writingPracticed: 0,
  timeSpentSeconds: 0,
  streak: 0,
};

export const useProgressStore = create<ProgressState & ProgressActions>((set, get) => ({
  weekProgress: new Map(),
  overallProgress: emptyOverall,
  streak: 0,
  todayStats: emptyStats,

  loadProgress: async () => {
    const [overall, streak, todayStats] = await Promise.all([
      getOverallProgress(),
      getDailyStreak(),
      getTodayStats(),
    ]);
    set({ overallProgress: overall, streak, todayStats });
  },

  markCharacterStudied: async (characterId: number) => {
    await updateProgress(characterId, {
      status: 'seen',
      lastStudied: new Date().toISOString().slice(0, 10),
    });
    await incrementTodayStat('new_chars_studied');
    await get().refreshStats();
  },

  recordReview: async (characterId: number, wasCorrect: boolean) => {
    const existing = await getProgress(characterId);
    const srsInput = {
      currentInterval: existing?.srsInterval ?? 0,
      currentFactor: existing?.srsFactor ?? 2.5,
      correctCount: existing?.correctCount ?? 0,
      wasCorrect,
    };
    const next = calculateNextReview(srsInput);
    await updateProgress(characterId, {
      status: next.status,
      srsInterval: next.srsInterval,
      srsFactor: next.srsFactor,
      nextReview: next.nextReview,
      lastReviewed: new Date().toISOString().slice(0, 10),
      correctCount: (existing?.correctCount ?? 0) + (wasCorrect ? 1 : 0),
      mistakeCount: (existing?.mistakeCount ?? 0) + (wasCorrect ? 0 : 1),
    });
    await incrementTodayStat('reviews_completed');
    await get().refreshStats();
  },

  recordWritingPractice: async (characterId: number, mistakes: number) => {
    const existing = await getProgress(characterId);
    await updateProgress(characterId, {
      writingMistakes: (existing?.writingMistakes ?? 0) + mistakes,
    });
    await incrementTodayStat('writing_practiced');
    await get().refreshStats();
  },

  refreshStats: async () => {
    const [overall, streak, todayStats] = await Promise.all([
      getOverallProgress(),
      getDailyStreak(),
      getTodayStats(),
    ]);
    set({ overallProgress: overall, streak, todayStats });
  },
}));
