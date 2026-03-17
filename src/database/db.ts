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
  // Bootstrap the migrations tracker table
  await database.execAsync(
    'CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY);'
  );

  const applied = await database.getAllAsync<{ id: number }>('SELECT id FROM _migrations;');
  const appliedSet = new Set(applied.map((r) => r.id));

  for (let i = 0; i < ALL_MIGRATIONS.length; i++) {
    if (appliedSet.has(i)) continue;
    try {
      await database.execAsync(ALL_MIGRATIONS[i]);
    } catch {
      // Idempotent migrations (e.g. ALTER TABLE on existing column) are safe to ignore
    }
    await database.runAsync('INSERT OR IGNORE INTO _migrations (id) VALUES (?);', [i]);
  }
}
