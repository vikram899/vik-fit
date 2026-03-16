import { getDatabase } from '../db';
import { StreakCondition } from '@shared/types/common';

export interface UserRow {
  id: number;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  unitPreference: 'metric' | 'imperial';
  targetWeight: number | null;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  targetCaloriesOverride: number | null;
  targetProteinOverride: number | null;
  streakCondition: StreakCondition;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserInput = Omit<UserRow, 'id'>;
export type UpdateUserInput = Partial<Omit<UserRow, 'id' | 'createdAt'>>;

export async function getUser(): Promise<UserRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<UserRow>('SELECT * FROM users LIMIT 1;');
  return result ?? null;
}

export async function createUser(input: CreateUserInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO users (name, age, gender, height, weight, activityLevel, goal, unitPreference, targetWeight, experienceLevel, targetCaloriesOverride, targetProteinOverride, streakCondition, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      input.name,
      input.age,
      input.gender,
      input.height,
      input.weight,
      input.activityLevel,
      input.goal,
      input.unitPreference,
      input.targetWeight ?? null,
      input.experienceLevel ?? null,
      input.targetCaloriesOverride ?? null,
      input.targetProteinOverride ?? null,
      input.streakCondition ?? 'any',
      input.createdAt,
      input.updatedAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const fields = Object.keys(input) as (keyof UpdateUserInput)[];
  const setClauses = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => input[f]);

  await db.runAsync(
    `UPDATE users SET ${setClauses}, updatedAt = ? WHERE id = ?;`,
    [...values, now, id]
  );
}
