// src/hooks/useWeekChars.ts

import { useEffect, useState } from 'react';
import { getCharactersByWeek } from '../db/queries';
import type { Character } from '../types/character';

/**
 * Fetch all characters for a given week.
 *
 * @example
 *   const { characters, loading } = useWeekChars(1);
 *   // characters = 265 Character objects for week 1
 */
export function useWeekChars(week: number) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCharactersByWeek(week)
      .then(setCharacters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [week]);

  return { characters, loading };
}
