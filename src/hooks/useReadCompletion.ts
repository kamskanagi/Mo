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
