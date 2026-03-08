import * as SQLite from 'expo-sqlite';
import { ALL_MIGRATIONS } from './migrations';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('fitness.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);

  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  for (const migration of ALL_MIGRATIONS) {
    try {
      await database.execAsync(migration);
    } catch {
      // Idempotent migrations (e.g. ALTER TABLE on existing column) are safe to ignore
    }
  }
}
