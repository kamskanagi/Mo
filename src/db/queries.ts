// src/db/queries.ts
//
// Typed query functions for all database operations.
// Every function gets the db instance from schema.ts.

import { getDatabase } from './schema';
import type { Character } from '../types/character';
import type { CharacterProgress, DailyStats, OverallProgress, WeekProgress } from '../types/progress';

// ─── Character Queries ───────────────────────────────────────

function parseCharacterRow(row: any): Character {
  return {
    ...row,
    examples: JSON.parse(row.examples || '[]'),
    examplePinyin: JSON.parse(row.example_pinyin || '[]'),
    strokeCount: row.stroke_count,
  };
}

export async function getCharacterById(id: number): Promise<Character | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM characters WHERE id = ?', id);
  return row ? parseCharacterRow(row) : null;
}

export async function getCharacterByChar(char: string): Promise<Character | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM characters WHERE character = ?', char);
  return row ? parseCharacterRow(row) : null;
}

export async function getCharactersByWeek(week: number): Promise<Character[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM characters WHERE week = ? ORDER BY id', week);
  return rows.map(parseCharacterRow);
}

export async function getCharactersByDay(day: number): Promise<Character[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM characters WHERE day = ? ORDER BY id', day);
  return rows.map(parseCharacterRow);
}

export async function getCharactersByRange(start: number, end: number): Promise<Character[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync(
    'SELECT * FROM characters WHERE id >= ? AND id <= ? ORDER BY id',
    start,
    end
  );
  return rows.map(parseCharacterRow);
}

export async function searchCharacters(query: string): Promise<Character[]> {
  const db = getDatabase();
  const like = `%${query}%`;
  const rows = await db.getAllAsync(
    `SELECT * FROM characters
     WHERE character = ? OR simplified = ? OR pinyin LIKE ? OR keyword LIKE ? OR definition LIKE ?
     ORDER BY id LIMIT 50`,
    query, query, like, like, like
  );
  return rows.map(parseCharacterRow);
}

// ─── Progress Queries ────────────────────────────────────────

export async function getProgress(characterId: number): Promise<CharacterProgress | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM user_progress WHERE character_id = ?',
    characterId
  );
  if (!row) return null;
  return {
    characterId: row.character_id,
    status: row.status,
    correctCount: row.correct_count,
    mistakeCount: row.mistake_count,
    writingMistakes: row.writing_mistakes,
    lastStudied: row.last_studied,
    lastReviewed: row.last_reviewed,
    nextReview: row.next_review,
    srsInterval: row.srs_interval,
    srsFactor: row.srs_factor,
  };
}

export async function updateProgress(
  characterId: number,
  update: Partial<CharacterProgress>
): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  const fieldMap: Record<string, string> = {
    status: 'status',
    correctCount: 'correct_count',
    mistakeCount: 'mistake_count',
    writingMistakes: 'writing_mistakes',
    lastStudied: 'last_studied',
    lastReviewed: 'last_reviewed',
    nextReview: 'next_review',
    srsInterval: 'srs_interval',
    srsFactor: 'srs_factor',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in update) {
      fields.push(`${col} = ?`);
      values.push((update as any)[key]);
    }
  }

  if (fields.length === 0) return;
  values.push(characterId);

  await db.runAsync(
    `UPDATE user_progress SET ${fields.join(', ')} WHERE character_id = ?`,
    ...values
  );
}

export async function getWeekProgress(week: number): Promise<WeekProgress> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN p.status != 'new' THEN 1 ELSE 0 END) as studied,
       SUM(CASE WHEN p.status = 'mastered' THEN 1 ELSE 0 END) as mastered
     FROM characters c
     LEFT JOIN user_progress p ON c.id = p.character_id
     WHERE c.week = ?`,
    week
  );
  return {
    week,
    total: row?.total ?? 0,
    studied: row?.studied ?? 0,
    mastered: row?.mastered ?? 0,
  };
}

export async function getOverallProgress(): Promise<OverallProgress> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
       SUM(CASE WHEN status = 'seen' THEN 1 ELSE 0 END) as seen_count,
       SUM(CASE WHEN status = 'learning' THEN 1 ELSE 0 END) as learning_count,
       SUM(CASE WHEN status = 'reviewing' THEN 1 ELSE 0 END) as reviewing_count,
       SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) as mastered_count
     FROM user_progress`
  );
  return {
    total: row?.total ?? 3183,
    new: row?.new_count ?? 3183,
    seen: row?.seen_count ?? 0,
    learning: row?.learning_count ?? 0,
    reviewing: row?.reviewing_count ?? 0,
    mastered: row?.mastered_count ?? 0,
  };
}

// ─── Review Queries ──────────────────────────────────────────

export async function getDueReviews(limit: number = 50): Promise<Character[]> {
  const db = getDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db.getAllAsync(
    `SELECT c.* FROM characters c
     INNER JOIN user_progress p ON c.id = p.character_id
     WHERE p.status IN ('learning', 'reviewing')
       AND (p.next_review IS NULL OR p.next_review <= ?)
     ORDER BY p.next_review ASC, p.mistake_count DESC
     LIMIT ?`,
    today,
    limit
  );
  return rows.map(parseCharacterRow);
}

export async function getDueReviewCount(): Promise<number> {
  const db = getDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM user_progress
     WHERE status IN ('learning', 'reviewing')
       AND (next_review IS NULL OR next_review <= ?)`,
    today
  );
  return row?.count ?? 0;
}

// ─── Daily Stats Queries ─────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayStats(): Promise<DailyStats> {
  const db = getDatabase();
  const date = todayStr();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM daily_stats WHERE date = ?',
    date
  );
  if (!row) {
    return {
      date,
      newCharactersStudied: 0,
      reviewsCompleted: 0,
      writingPracticed: 0,
      timeSpentSeconds: 0,
      streak: 0,
    };
  }
  return {
    date: row.date,
    newCharactersStudied: row.new_chars_studied,
    reviewsCompleted: row.reviews_completed,
    writingPracticed: row.writing_practiced,
    timeSpentSeconds: row.time_spent_seconds,
    streak: row.streak,
  };
}

export async function incrementTodayStat(
  field: 'new_chars_studied' | 'reviews_completed' | 'writing_practiced',
  amount: number = 1
): Promise<void> {
  const db = getDatabase();
  const date = todayStr();
  await db.runAsync(
    `INSERT INTO daily_stats (date, ${field}) VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET ${field} = ${field} + ?`,
    date,
    amount,
    amount
  );
}

export async function getDailyStreak(): Promise<number> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ date: string }>(
    `SELECT date FROM daily_stats
     WHERE new_chars_studied > 0 OR reviews_completed > 0
     ORDER BY date DESC LIMIT 90`
  );

  if (rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < rows.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);

    if (rows[i].date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function getStreakCalendar(
  days: number = 90
): Promise<Array<{ date: string; count: number }>> {
  const db = getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rows = await db.getAllAsync<{ date: string; count: number }>(
    `SELECT date, (new_chars_studied + reviews_completed + writing_practiced) as count
     FROM daily_stats
     WHERE date >= ?
     ORDER BY date ASC`,
    startDate.toISOString().slice(0, 10)
  );
  return rows;
}

// ─── Settings Queries ────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    key
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
    key,
    value,
    value
  );
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings'
  );
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

// ─── User / Auth Queries ─────────────────────────────────────

export interface UserRow {
  id: number;
  email: string;
  display_name: string;
  password_hash: string;
  password_salt: string;
  created_at: string;
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE email = ? COLLATE NOCASE',
    email.toLowerCase().trim()
  );
  return row ?? null;
}

export async function getUserById(id: number): Promise<UserRow | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE id = ?',
    id
  );
  return row ?? null;
}

export async function createUser(
  email: string,
  displayName: string,
  passwordHash: string,
  passwordSalt: string
): Promise<number> {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO users (email, display_name, password_hash, password_salt) VALUES (?, ?, ?, ?)`,
    email.toLowerCase().trim(),
    displayName.trim(),
    passwordHash,
    passwordSalt
  );
  return result.lastInsertRowId;
}
