import { getDatabase } from '../db';

export interface MealTemplateRow {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  isFavorite: number; // 0 | 1
  createdAt: string;
  updatedAt: string;
}

export type CreateMealTemplateInput = Omit<MealTemplateRow, 'id'>;
export type UpdateMealTemplateInput = Partial<Omit<MealTemplateRow, 'id' | 'createdAt'>>;

export async function getAllMealTemplates(): Promise<MealTemplateRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<MealTemplateRow>('SELECT * FROM meal_templates ORDER BY name ASC;');
}

export async function getMealTemplatesByCategory(
  category: MealTemplateRow['category']
): Promise<MealTemplateRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<MealTemplateRow>(
    'SELECT * FROM meal_templates WHERE category = ? ORDER BY name ASC;',
    [category]
  );
}

export async function getFavoriteMealTemplates(): Promise<MealTemplateRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<MealTemplateRow>(
    'SELECT * FROM meal_templates WHERE isFavorite = 1 ORDER BY name ASC;'
  );
}

export async function getMealTemplateById(id: number): Promise<MealTemplateRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<MealTemplateRow>(
    'SELECT * FROM meal_templates WHERE id = ?;',
    [id]
  );
  return result ?? null;
}

export async function createMealTemplate(input: CreateMealTemplateInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO meal_templates (name, calories, protein, carbs, fat, category, isFavorite, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      input.name,
      input.calories,
      input.protein,
      input.carbs,
      input.fat,
      input.category,
      input.isFavorite,
      input.createdAt,
      input.updatedAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateMealTemplate(id: number, input: UpdateMealTemplateInput): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const fields = Object.keys(input) as (keyof UpdateMealTemplateInput)[];
  const setClauses = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => input[f]);

  await db.runAsync(
    `UPDATE meal_templates SET ${setClauses}, updatedAt = ? WHERE id = ?;`,
    [...values, now, id]
  );
}

export async function toggleMealTemplateFavorite(id: number, isFavorite: boolean): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE meal_templates SET isFavorite = ?, updatedAt = ? WHERE id = ?;',
    [isFavorite ? 1 : 0, now, id]
  );
}

export async function deleteMealTemplate(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM meal_templates WHERE id = ?;', [id]);
}
