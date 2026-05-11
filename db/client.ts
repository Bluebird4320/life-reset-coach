import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const sqlite = openDatabaseSync('onestep.db');
export const db = drizzle(sqlite, { schema });

// テーブルを初期化する（マイグレーション代わりのDDL）
export async function initDB(): Promise<void> {
  try {
    await sqlite.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        vision TEXT NOT NULL,
        category TEXT NOT NULL,
        increase_actions TEXT,
        decrease_actions TEXT,
        deadline TEXT,
        daily_minutes INTEGER DEFAULT 15,
        progress_pct REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS actions (
        id TEXT PRIMARY KEY,
        goal_id TEXT NOT NULL,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        target_minutes INTEGER DEFAULT 15,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS records (
        id TEXT PRIMARY KEY,
        action_id TEXT NOT NULL,
        date TEXT NOT NULL,
        elapsed_seconds INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        mood TEXT,
        memo TEXT,
        next_action TEXT,
        ai_coach_msg TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS streaks (
        id TEXT PRIMARY KEY,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_record_date TEXT,
        updated_at TEXT NOT NULL
      );
    `);
  } catch (e) {
    console.error('initDB error:', e);
  }
}
