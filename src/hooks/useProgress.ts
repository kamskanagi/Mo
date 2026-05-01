import { useProgressStore } from '../stores/useProgressStore';

export function useProgress() {
  return useProgressStore((s) => ({
    overallProgress: s.overallProgress,
    streak: s.streak,
    todayStats: s.todayStats,
    weekProgress: s.weekProgress,
    markCharacterStudied: s.markCharacterStudied,
    recordReview: s.recordReview,
    recordWritingPractice: s.recordWritingPractice,
    refreshStats: s.refreshStats,
  }));
}
