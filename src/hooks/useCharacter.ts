// src/hooks/useCharacter.ts

import { useEffect, useState } from 'react';
import { getCharacterById, getCharacterByChar } from '../db/queries';
import type { Character } from '../types/character';

/**
 * Fetch a single character by its ID.
 *
 * @example
 *   const { character, loading } = useCharacter(42);
 */
export function useCharacter(id: number | null) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === null) {
      setCharacter(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getCharacterById(id)
      .then(setCharacter)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return { character, loading };
}

/**
 * Fetch a single character by its Chinese character string.
 *
 * @example
 *   const { character, loading } = useCharacterByChar('一');
 */
export function useCharacterByChar(char: string | null) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!char) {
      setCharacter(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getCharacterByChar(char)
      .then(setCharacter)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [char]);

  return { character, loading };
}
