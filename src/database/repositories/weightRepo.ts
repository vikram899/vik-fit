import { getDatabase } from '../db';

export interface WeightLogRow {
  id: number;
  weight: number;
  note: string | null;
  loggedAt: string;
  createdAt: string;
}

export type CreateWeightLogInput = Omit<WeightLogRow, 'id'>;

export async function logWeight(input: CreateWeightLogInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO weight_logs (weight, note, loggedAt, createdAt) VALUES (?, ?, ?, ?);',
    [input.weight, input.note ?? null, input.loggedAt, input.createdAt]
  );
  return result.lastInsertRowId;
}

export async function getRecentWeightLogs(limit: number = 10): Promise<WeightLogRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<WeightLogRow>(
    'SELECT * FROM weight_logs ORDER BY loggedAt DESC LIMIT ?;',
    [limit]
  );
}

export async function getLatestWeightLog(): Promise<WeightLogRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<WeightLogRow>(
    'SELECT * FROM weight_logs ORDER BY loggedAt DESC LIMIT 1;'
  );
  return result ?? null;
}

export async function deleteWeightLog(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM weight_logs WHERE id = ?;', [id]);
}

export async function getWeightLogDates(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ d: string }>(
    'SELECT DISTINCT date(loggedAt) as d FROM weight_logs ORDER BY d DESC;'
  );
  return rows.map((r) => r.d);
}
