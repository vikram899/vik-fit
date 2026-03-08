import { getDatabase } from '../db';

export interface MealLogRow {
  id: number;
  templateId: number | null;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  eatenAt: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateMealLogInput = Omit<MealLogRow, 'id'>;
export type UpdateMealLogInput = Partial<Omit<MealLogRow, 'id' | 'createdAt'>>;

export async function getMealLogsByDate(dateStr: string): Promise<MealLogRow[]> {
  // dateStr format: 'YYYY-MM-DD'
  const db = await getDatabase();
  return db.getAllAsync<MealLogRow>(
    `SELECT * FROM meal_logs WHERE date(eatenAt) = ? ORDER BY eatenAt ASC;`,
    [dateStr]
  );
}

export async function getMealLogsByDateAndCategory(
  dateStr: string,
  category: MealLogRow['category']
): Promise<MealLogRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<MealLogRow>(
    `SELECT * FROM meal_logs WHERE date(eatenAt) = ? AND category = ? ORDER BY eatenAt ASC;`,
    [dateStr, category]
  );
}

export async function getMealLogById(id: number): Promise<MealLogRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<MealLogRow>(
    'SELECT * FROM meal_logs WHERE id = ?;',
    [id]
  );
  return result ?? null;
}

export async function createMealLog(input: CreateMealLogInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO meal_logs (templateId, name, calories, protein, carbs, fat, category, eatenAt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      input.templateId ?? null,
      input.name,
      input.calories,
      input.protein,
      input.carbs,
      input.fat,
      input.category,
      input.eatenAt,
      input.createdAt,
      input.updatedAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateMealLog(id: number, input: UpdateMealLogInput): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const fields = Object.keys(input) as (keyof UpdateMealLogInput)[];
  const setClauses = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => input[f]);

  await db.runAsync(
    `UPDATE meal_logs SET ${setClauses}, updatedAt = ? WHERE id = ?;`,
    [...values, now, id]
  );
}

export async function deleteMealLog(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM meal_logs WHERE id = ?;', [id]);
}

export async function getRecentMealLogs(limit: number = 10): Promise<MealLogRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<MealLogRow>(
    'SELECT * FROM meal_logs ORDER BY eatenAt DESC LIMIT ?;',
    [limit]
  );
}

export async function getMealLogDates(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ d: string }>(
    'SELECT DISTINCT date(eatenAt) as d FROM meal_logs ORDER BY d DESC;'
  );
  return rows.map((r) => r.d);
}
