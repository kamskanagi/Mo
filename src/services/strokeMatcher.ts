// src/services/strokeMatcher.ts
//
// Validates user-drawn strokes against expected stroke data
// using Dynamic Time Warping (DTW) for path comparison.
//
// This is the core of the writing practice feature.
// It compares the user's drawn path to the expected median path
// and determines if the stroke was drawn correctly.

export interface Point {
  x: number;
  y: number;
}

export interface StrokeResult {
  isCorrect: boolean;
  similarity: number;        // 0-1, where 1 is perfect
  directionCorrect: boolean;
  message: string;
}

/**
 * Compare a user-drawn stroke to the expected median path.
 *
 * @param drawn - Points captured from the user's touch input
 * @param expected - Median points from the stroke data
 * @param tolerance - How much deviation to allow (0-1, default 0.3 = 30%)
 * @returns StrokeResult with correctness and similarity score
 *
 * @example
 *   const result = matchStroke(userPoints, expectedMedian, 0.3);
 *   if (result.isCorrect) {
 *     // Show success feedback
 *   }
 */
export function matchStroke(
  drawn: Point[],
  expected: Point[],
  tolerance: number = 0.3
): StrokeResult {
  if (drawn.length < 2) {
    return {
      isCorrect: false,
      similarity: 0,
      directionCorrect: false,
      message: 'Stroke too short. Try drawing a longer stroke.',
    };
  }

  // Normalize both paths to the same scale (0-1)
  const normalizedDrawn = normalizePath(drawn);
  const normalizedExpected = normalizePath(expected);

  // Resample to same number of points for fair comparison
  const sampledDrawn = resamplePath(normalizedDrawn, 32);
  const sampledExpected = resamplePath(normalizedExpected, 32);

  // Calculate DTW distance
  const dtwDist = dtwDistance(sampledDrawn, sampledExpected);

  // Normalize distance to 0-1 similarity score
  const maxPossibleDist = Math.sqrt(2) * 32; // worst case diagonal across unit square
  const similarity = Math.max(0, 1 - dtwDist / maxPossibleDist);

  // Check direction (start and end points should match roughly)
  const directionCorrect = checkDirection(sampledDrawn, sampledExpected, 0.4);

  const isCorrect = similarity >= (1 - tolerance) && directionCorrect;

  let message: string;
  if (isCorrect) {
    if (similarity > 0.9) message = 'Perfect stroke!';
    else if (similarity > 0.8) message = 'Good stroke!';
    else message = 'Acceptable — keep practicing!';
  } else if (!directionCorrect) {
    message = 'Wrong direction. Check the stroke order.';
  } else {
    message = 'Shape doesn\'t match. Try following the guide more closely.';
  }

  return { isCorrect, similarity, directionCorrect, message };
}

/**
 * Dynamic Time Warping distance between two point sequences.
 * DTW is tolerant of speed variations — it finds the best
 * alignment between the two paths regardless of drawing speed.
 */
function dtwDistance(a: Point[], b: Point[]): number {
  const n = a.length;
  const m = b.length;

  // Cost matrix
  const dtw: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(Infinity)
  );
  dtw[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = pointDistance(a[i - 1], b[j - 1]);
      dtw[i][j] = cost + Math.min(
        dtw[i - 1][j],     // insertion
        dtw[i][j - 1],     // deletion
        dtw[i - 1][j - 1]  // match
      );
    }
  }

  return dtw[n][m];
}

/**
 * Euclidean distance between two points.
 */
function pointDistance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Normalize a path so all points fit within (0,0) to (1,1).
 */
function normalizePath(points: Point[]): Point[] {
  if (points.length === 0) return [];

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const range = Math.max(rangeX, rangeY);

  return points.map((p) => ({
    x: (p.x - minX) / range,
    y: (p.y - minY) / range,
  }));
}

/**
 * Resample a path to have exactly N evenly-spaced points.
 * This ensures fair comparison regardless of drawing speed.
 */
function resamplePath(points: Point[], n: number): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array(n).fill(points[0]);

  // Calculate total path length
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    totalLength += pointDistance(points[i - 1], points[i]);
  }

  const segmentLength = totalLength / (n - 1);
  const resampled: Point[] = [points[0]];
  let accumulated = 0;
  let j = 1;

  for (let i = 1; i < n - 1; i++) {
    const targetDist = i * segmentLength;

    while (j < points.length) {
      const d = pointDistance(points[j - 1], points[j]);
      if (accumulated + d >= targetDist) {
        const ratio = (targetDist - accumulated) / d;
        resampled.push({
          x: points[j - 1].x + ratio * (points[j].x - points[j - 1].x),
          y: points[j - 1].y + ratio * (points[j].y - points[j - 1].y),
        });
        break;
      }
      accumulated += d;
      j++;
    }

    // Fallback if we've run out of points
    if (resampled.length < i + 1) {
      resampled.push(points[points.length - 1]);
    }
  }

  resampled.push(points[points.length - 1]);
  return resampled;
}

/**
 * Check if the drawn stroke goes in the same general direction
 * as the expected stroke by comparing start and end regions.
 */
function checkDirection(
  drawn: Point[],
  expected: Point[],
  maxDeviation: number
): boolean {
  if (drawn.length < 2 || expected.length < 2) return false;

  const drawnStart = drawn[0];
  const drawnEnd = drawn[drawn.length - 1];
  const expectedStart = expected[0];
  const expectedEnd = expected[expected.length - 1];

  const startDist = pointDistance(drawnStart, expectedStart);
  const endDist = pointDistance(drawnEnd, expectedEnd);

  // Also check if drawn backwards
  const reverseStartDist = pointDistance(drawnStart, expectedEnd);
  const reverseEndDist = pointDistance(drawnEnd, expectedStart);

  const forwardError = startDist + endDist;
  const reverseError = reverseStartDist + reverseEndDist;

  // It's backwards if the reverse match is much better
  if (reverseError < forwardError * 0.5) return false;

  // Check that start and end are close enough to expected
  return startDist < maxDeviation && endDist < maxDeviation;
}
