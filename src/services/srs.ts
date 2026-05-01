// src/services/srs.ts
//
// SM-2 based spaced repetition algorithm.
// Calculates the next review date and interval based on user performance.
//
// The algorithm:
// - New cards start at interval 0 (review same day)
// - After first correct: interval = 1 day
// - After second correct: interval = 3 days
// - After that: interval = previous_interval × ease_factor
// - Ease factor starts at 2.5, adjusts based on performance
// - Mistakes reset interval to 1 day and decrease ease factor
// - Ease factor never drops below 1.3

export interface SrsUpdate {
  srsInterval: number;   // new interval in days
  srsFactor: number;     // updated ease factor
  nextReview: string;    // ISO date string (YYYY-MM-DD)
  status: 'learning' | 'reviewing' | 'mastered';
}

export interface SrsInput {
  currentInterval: number;
  currentFactor: number;
  correctCount: number;
  wasCorrect: boolean;
}

/**
 * Calculate the next review schedule based on the SM-2 algorithm.
 *
 * @param input - Current SRS state and whether the review was correct
 * @returns Updated SRS values including next review date
 *
 * @example
 *   const result = calculateNextReview({
 *     currentInterval: 3,
 *     currentFactor: 2.5,
 *     correctCount: 4,
 *     wasCorrect: true,
 *   });
 *   // result.srsInterval = 7
 *   // result.nextReview = '2026-05-07'
 */
export function calculateNextReview(input: SrsInput): SrsUpdate {
  const { currentInterval, currentFactor, correctCount, wasCorrect } = input;

  let newInterval: number;
  let newFactor: number;
  let status: 'learning' | 'reviewing' | 'mastered';

  if (!wasCorrect) {
    // Mistake: reset to short interval, decrease ease factor
    newInterval = 1;
    newFactor = Math.max(1.3, currentFactor - 0.2);
    status = 'learning';
  } else {
    // Correct answer: increase interval
    newFactor = Math.max(1.3, currentFactor + 0.05);

    if (currentInterval === 0) {
      // First time correct
      newInterval = 1;
      status = 'learning';
    } else if (currentInterval === 1) {
      // Second time correct
      newInterval = 3;
      status = 'learning';
    } else if (currentInterval === 3) {
      // Third time correct
      newInterval = 7;
      status = 'reviewing';
    } else {
      // Subsequent: multiply by ease factor
      newInterval = Math.round(currentInterval * newFactor);
      status = newInterval >= 90 ? 'mastered' : 'reviewing';
    }
  }

  // Cap interval at 365 days
  newInterval = Math.min(newInterval, 365);

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);
  const nextReview = nextDate.toISOString().slice(0, 10);

  return {
    srsInterval: newInterval,
    srsFactor: Math.round(newFactor * 100) / 100,
    nextReview,
    status,
  };
}

/**
 * Standard review intervals for display purposes.
 * Shows what a character's journey looks like with all correct reviews.
 */
export const IDEAL_INTERVALS = [1, 3, 7, 14, 30, 60, 90];

/**
 * Get a human-readable description of the next review interval.
 */
export function formatInterval(days: number): string {
  if (days === 0) return 'Now';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days`;
  if (days < 14) return '1 week';
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  if (days < 60) return '1 month';
  if (days < 365) return `${Math.round(days / 30)} months`;
  return '1 year';
}

/**
 * Determine how many reviews are due today.
 */
export function isDueToday(nextReview: string | null): boolean {
  if (!nextReview) return true; // Never reviewed = due now
  const today = new Date().toISOString().slice(0, 10);
  return nextReview <= today;
}
