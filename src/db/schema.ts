// src/db/schema.ts
//
// SQLite database schema for HanziStudio.
// Uses expo-sqlite (v14+) with the new synchronous API.

import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

const SCHEMA_VERSION = 2;

/**
 * Open (or create) the database and ensure all tables exist.
 * Safe to call multiple times — returns the cached instance.
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  const db = await SQLite.openDatabaseAsync('hanzistudio.db');

  // Enable WAL mode for better concurrent performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Create tables
  await db.execAsync(`
    -- Schema versioning
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );

    -- All 3,183 characters (reference data, read-only after seed)
    CREATE TABLE IF NOT EXISTS characters (
      id            INTEGER PRIMARY KEY,
      character     TEXT    NOT NULL,
      simplified    TEXT,
      pinyin        TEXT    NOT NULL,
      tone          INTEGER NOT NULL DEFAULT 5,
      keyword       TEXT    NOT NULL,
      definition    TEXT    NOT NULL DEFAULT '',
      examples      TEXT    NOT NULL DEFAULT '[]',
      example_pinyin TEXT   NOT NULL DEFAULT '[]',
      stroke_count  INTEGER NOT NULL DEFAULT 0,
      frequency     INTEGER NOT NULL DEFAULT 0,
      week          INTEGER NOT NULL,
      day           INTEGER NOT NULL
    );

    -- Per-character learning progress
    CREATE TABLE IF NOT EXISTS user_progress (
      character_id    INTEGER PRIMARY KEY,
      status          TEXT    NOT NULL DEFAULT 'new',
      correct_count   INTEGER NOT NULL DEFAULT 0,
      mistake_count   INTEGER NOT NULL DEFAULT 0,
      writing_mistakes INTEGER NOT NULL DEFAULT 0,
      last_studied    TEXT,
      last_reviewed   TEXT,
      next_review     TEXT,
      srs_interval    INTEGER NOT NULL DEFAULT 0,
      srs_factor      REAL    NOT NULL DEFAULT 2.5,
      FOREIGN KEY (character_id) REFERENCES characters(id)
    );

    -- Daily usage statistics
    CREATE TABLE IF NOT EXISTS daily_stats (
      date                TEXT PRIMARY KEY,
      new_chars_studied   INTEGER NOT NULL DEFAULT 0,
      reviews_completed   INTEGER NOT NULL DEFAULT 0,
      writing_practiced   INTEGER NOT NULL DEFAULT 0,
      time_spent_seconds  INTEGER NOT NULL DEFAULT 0,
      streak              INTEGER NOT NULL DEFAULT 0
    );

    -- Key-value settings store
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- User accounts
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      display_name  TEXT    NOT NULL DEFAULT '',
      password_hash TEXT    NOT NULL,
      password_salt TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_chars_week ON characters(week);
    CREATE INDEX IF NOT EXISTS idx_chars_day ON characters(day);
    CREATE INDEX IF NOT EXISTS idx_progress_status ON user_progress(status);
    CREATE INDEX IF NOT EXISTS idx_progress_next_review ON user_progress(next_review);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email COLLATE NOCASE);
  `);

  // Check and set schema version
  const versionRow = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1'
  );

  if (!versionRow) {
    await db.runAsync('INSERT INTO schema_version (version) VALUES (?)', SCHEMA_VERSION);
  } else if (versionRow.version < SCHEMA_VERSION) {
    // Run migrations here when schema changes
    await runMigrations(db, versionRow.version, SCHEMA_VERSION);
    await db.runAsync('UPDATE schema_version SET version = ?', SCHEMA_VERSION);
  }

  _db = db;
  return db;
}

/**
 * Get the cached database instance.
 * Throws if initDatabase() hasn't been called yet.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!_db) throw new Error('Database not initialized. Call initDatabase() first.');
  return _db;
}

/**
 * Run schema migrations from oldVersion to newVersion.
 * Add migration steps here as the schema evolves.
 */
async function runMigrations(
  db: SQLite.SQLiteDatabase,
  oldVersion: number,
  newVersion: number
): Promise<void> {
  console.log(`Migrating database from v${oldVersion} to v${newVersion}`);

  if (oldVersion < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
        display_name  TEXT    NOT NULL DEFAULT '',
        password_hash TEXT    NOT NULL,
        password_salt TEXT    NOT NULL,
        created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email COLLATE NOCASE);
    `);
  }
}

/**
 * Check if the characters table has been seeded.
 */
export async function isSeeded(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM characters'
  );
  return (row?.count ?? 0) > 0;
}

/**
 * Close the database connection. Call on app shutdown if needed.
 */
export async function closeDatabase(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}
