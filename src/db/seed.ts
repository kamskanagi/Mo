// src/db/seed.ts
//
// Imports the character dataset from the bundled JSON into SQLite.
// Only runs once — skipped if the characters table already has data.

import type { SQLiteDatabase } from 'expo-sqlite';
import { isSeeded } from './schema';
import characterData from '../data/characters.json';

interface RawCharacter {
  id: number;
  character: string;
  simplified: string | null;
  pinyin: string;
  tone: number;
  keyword: string;
  definition: string;
  examples: string[];
  examplePinyin: string[];
  strokeCount: number;
  frequency: number;
  week: number;
  day: number;
}

/**
 * Seed all 3,183 characters into the SQLite database.
 * Uses a single transaction for performance (~1-2 seconds total).
 *
 * @param db - The SQLite database instance
 * @param onProgress - Optional callback reporting progress (0-100)
 */
export async function seedCharacters(
  db: SQLiteDatabase,
  onProgress?: (percent: number) => void
): Promise<void> {
  // Skip if already seeded
  if (await isSeeded(db)) {
    console.log('Database already seeded, skipping.');
    return;
  }

  const chars = characterData as RawCharacter[];
  console.log(`Seeding ${chars.length} characters...`);

  const BATCH_SIZE = 200;
  const totalBatches = Math.ceil(chars.length / BATCH_SIZE);

  for (let batch = 0; batch < totalBatches; batch++) {
    const start = batch * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, chars.length);
    const slice = chars.slice(start, end);

    await db.withTransactionAsync(async () => {
      for (const c of slice) {
        await db.runAsync(
          `INSERT OR IGNORE INTO characters
           (id, character, simplified, pinyin, tone, keyword, definition,
            examples, example_pinyin, stroke_count, frequency, week, day)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          c.id,
          c.character,
          c.simplified,
          c.pinyin,
          c.tone,
          c.keyword,
          c.definition,
          JSON.stringify(c.examples),
          JSON.stringify(c.examplePinyin),
          c.strokeCount,
          c.frequency,
          c.week,
          c.day
        );
      }
    });

    const percent = Math.round(((batch + 1) / totalBatches) * 100);
    onProgress?.(percent);

    if ((batch + 1) % 5 === 0 || batch === totalBatches - 1) {
      console.log(`  Seeded ${end}/${chars.length} characters (${percent}%)`);
    }
  }

  // Also initialize user_progress rows for all characters
  await db.withTransactionAsync(async () => {
    await db.runAsync(`
      INSERT OR IGNORE INTO user_progress (character_id)
      SELECT id FROM characters
    `);
  });

  console.log('Seeding complete.');
}
