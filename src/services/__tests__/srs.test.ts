/**
 * @jest-environment node
 */
import {
  calculateNextReview,
  calculateNextReviewRated,
  formatInterval,
  isDueToday,
} from '../srs';

describe('calculateNextReview', () => {
  const baseInput = {
    currentInterval: 0,
    currentFactor: 2.5,
    correctCount: 0,
    wasCorrect: true,
  };

  it('first correct answer sets interval to 1 and status to learning', () => {
    const result = calculateNextReview({ ...baseInput, currentInterval: 0, wasCorrect: true });
    expect(result.srsInterval).toBe(1);
    expect(result.status).toBe('learning');
    expect(result.srsFactor).toBeGreaterThan(2.5);
  });

  it('second correct answer (interval=1) sets interval to 3', () => {
    const result = calculateNextReview({ ...baseInput, currentInterval: 1, wasCorrect: true });
    expect(result.srsInterval).toBe(3);
    expect(result.status).toBe('learning');
  });

  it('third correct answer (interval=3) sets interval to 7 and status to reviewing', () => {
    const result = calculateNextReview({ ...baseInput, currentInterval: 3, wasCorrect: true });
    expect(result.srsInterval).toBe(7);
    expect(result.status).toBe('reviewing');
  });

  it('subsequent correct answers multiply by ease factor', () => {
    const result = calculateNextReview({ ...baseInput, currentInterval: 7, currentFactor: 2.5, wasCorrect: true });
    expect(result.srsInterval).toBe(Math.round(7 * (2.5 + 0.05)));
    expect(result.status).toBe('reviewing');
  });

  it('status becomes mastered when interval >= 90', () => {
    const result = calculateNextReview({ ...baseInput, currentInterval: 60, currentFactor: 2.5, wasCorrect: true });
    expect(result.status).toBe('mastered');
  });

  it('mistake resets interval to 1 and decreases ease factor', () => {
    const result = calculateNextReview({ ...baseInput, currentInterval: 30, currentFactor: 2.5, wasCorrect: false });
    expect(result.srsInterval).toBe(1);
    expect(result.srsFactor).toBe(2.3);
    expect(result.status).toBe('learning');
  });

  it('ease factor never drops below 1.3', () => {
    const result = calculateNextReview({ ...baseInput, currentInterval: 1, currentFactor: 1.3, wasCorrect: false });
    expect(result.srsFactor).toBe(1.3);
  });

  it('interval is capped at 365 days', () => {
    const result = calculateNextReview({ ...baseInput, currentInterval: 300, currentFactor: 2.5, wasCorrect: true });
    expect(result.srsInterval).toBeLessThanOrEqual(365);
  });

  it('nextReview is a valid YYYY-MM-DD date string in the future', () => {
    const result = calculateNextReview({ ...baseInput, wasCorrect: true });
    expect(result.nextReview).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const today = new Date().toISOString().slice(0, 10);
    expect(result.nextReview >= today).toBe(true);
  });
});

describe('formatInterval', () => {
  it('returns "Now" for 0 days', () => expect(formatInterval(0)).toBe('Now'));
  it('returns "Tomorrow" for 1 day', () => expect(formatInterval(1)).toBe('Tomorrow'));
  it('returns "5 days" for 5 days', () => expect(formatInterval(5)).toBe('5 days'));
  it('returns "1 week" for 7 days', () => expect(formatInterval(7)).toBe('1 week'));
  it('returns "1 month" for 30 days', () => expect(formatInterval(30)).toBe('1 month'));
  it('returns "1 year" for 365 days', () => expect(formatInterval(365)).toBe('1 year'));
});

describe('isDueToday', () => {
  it('returns true when nextReview is null (never reviewed)', () => {
    expect(isDueToday(null)).toBe(true);
  });

  it('returns true when nextReview is today', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(isDueToday(today)).toBe(true);
  });

  it('returns true when nextReview is in the past', () => {
    expect(isDueToday('2020-01-01')).toBe(true);
  });

  it('returns false when nextReview is in the future', () => {
    expect(isDueToday('2099-12-31')).toBe(false);
  });
});

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
    expect(r.srsFactor).toBeCloseTo(2.35, 2);
    expect(r.status).toBe('reviewing');
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
