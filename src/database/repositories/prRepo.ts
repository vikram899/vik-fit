import { getDatabase } from '../db';

export interface TrackedPRExercise {
  exerciseTemplateId: number;
  exerciseName: string;
  exerciseType: string;
  addedAt: string;
}

export async function getTrackedPRExercises(): Promise<TrackedPRExercise[]> {
  const db = await getDatabase();
  return db.getAllAsync<TrackedPRExercise>(
    `SELECT p.exerciseTemplateId, et.name AS exerciseName, et.type AS exerciseType, p.addedAt
     FROM pr_tracked_exercises p
     JOIN exercise_templates et ON et.id = p.exerciseTemplateId
     ORDER BY p.addedAt ASC;`
  );
}

export async function addTrackedPRExercise(exerciseTemplateId: number): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT OR IGNORE INTO pr_tracked_exercises (exerciseTemplateId, addedAt) VALUES (?, ?);',
    [exerciseTemplateId, now]
  );
}

export async function removeTrackedPRExercise(exerciseTemplateId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM pr_tracked_exercises WHERE exerciseTemplateId = ?;',
    [exerciseTemplateId]
  );
}
