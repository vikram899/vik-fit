import { getDatabase } from '../db';

export async function getTodaySteps(date: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ steps: number }>(
    'SELECT steps FROM steps_logs WHERE date = ?',
    [date],
  );
  return row?.steps ?? 0;
}

export async function upsertSteps(date: string, steps: number): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO steps_logs (date, steps, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
    [date, steps, now, now],
  );
}

export async function getActiveBurned(date: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ activeBurned: number }>(
    'SELECT activeBurned FROM steps_logs WHERE date = ?',
    [date],
  );
  return row?.activeBurned ?? 0;
}

export async function upsertActiveBurned(date: string, calories: number): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO steps_logs (date, steps, activeBurned, createdAt, updatedAt)
     VALUES (?, 0, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET activeBurned = excluded.activeBurned, updatedAt = excluded.updatedAt`,
    [date, calories, now, now],
  );
}
