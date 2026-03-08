import { getDatabase } from '../db';

// --- Exercise Templates ---

export interface ExerciseTemplateRow {
  id: number;
  name: string;
  type: string; // ExerciseType
  targetMuscle: string;
  secondaryMuscle: string | null;
  isFavorite: number; // 0 | 1
  createdAt: string;
  updatedAt: string;
}

export type CreateExerciseTemplateInput = Omit<ExerciseTemplateRow, 'id'>;

export async function getAllExerciseTemplates(): Promise<ExerciseTemplateRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<ExerciseTemplateRow>(
    'SELECT * FROM exercise_templates ORDER BY name ASC;'
  );
}

export async function getExerciseTemplateById(id: number): Promise<ExerciseTemplateRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<ExerciseTemplateRow>(
    'SELECT * FROM exercise_templates WHERE id = ?;',
    [id]
  );
  return result ?? null;
}

export async function createExerciseTemplate(input: CreateExerciseTemplateInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO exercise_templates (name, type, targetMuscle, secondaryMuscle, isFavorite, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      input.name,
      input.type,
      input.targetMuscle,
      input.secondaryMuscle ?? null,
      input.isFavorite,
      input.createdAt,
      input.updatedAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function deleteExerciseTemplate(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM exercise_templates WHERE id = ?;', [id]);
}

export async function toggleExerciseFavorite(id: number, isFavorite: boolean): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE exercise_templates SET isFavorite = ?, updatedAt = ? WHERE id = ?;',
    [isFavorite ? 1 : 0, now, id]
  );
}

// --- Exercise Logs ---

export interface ExerciseLogRow {
  id: number;
  workoutLogId: number;
  exerciseTemplateId: number;
  orderIndex: number;
  createdAt: string;
}

export type CreateExerciseLogInput = Omit<ExerciseLogRow, 'id'>;

export async function getExerciseLogsByWorkoutLogId(workoutLogId: number): Promise<ExerciseLogRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<ExerciseLogRow>(
    'SELECT * FROM exercise_logs WHERE workoutLogId = ? ORDER BY orderIndex ASC;',
    [workoutLogId]
  );
}

export async function createExerciseLog(input: CreateExerciseLogInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO exercise_logs (workoutLogId, exerciseTemplateId, orderIndex, createdAt)
     VALUES (?, ?, ?, ?);`,
    [input.workoutLogId, input.exerciseTemplateId, input.orderIndex, input.createdAt]
  );
  return result.lastInsertRowId;
}

// --- Set Logs ---

export interface SetLogRow {
  id: number;
  exerciseLogId: number;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  durationSeconds: number | null;
  completed: number; // 0 | 1
  createdAt: string;
}

export type CreateSetLogInput = Omit<SetLogRow, 'id'>;
export type UpdateSetLogInput = Partial<Omit<SetLogRow, 'id' | 'exerciseLogId' | 'createdAt'>>;

export async function getSetLogsByExerciseLogId(exerciseLogId: number): Promise<SetLogRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<SetLogRow>(
    'SELECT * FROM set_logs WHERE exerciseLogId = ? ORDER BY setNumber ASC;',
    [exerciseLogId]
  );
}

export async function createSetLog(input: CreateSetLogInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO set_logs (exerciseLogId, setNumber, reps, weight, durationSeconds, completed, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      input.exerciseLogId,
      input.setNumber,
      input.reps ?? null,
      input.weight ?? null,
      input.durationSeconds ?? null,
      input.completed,
      input.createdAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateSetLog(id: number, input: UpdateSetLogInput): Promise<void> {
  const db = await getDatabase();
  const fields = Object.keys(input) as (keyof UpdateSetLogInput)[];
  const setClauses = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => input[f]);

  await db.runAsync(
    `UPDATE set_logs SET ${setClauses} WHERE id = ?;`,
    [...values, id]
  );
}

export async function deleteSetLog(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM set_logs WHERE id = ?;', [id]);
}

// --- Previous Performance ---

export interface PreviousSetRow {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
}

export async function getLastSetLogsForExercise(exerciseTemplateId: number): Promise<PreviousSetRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<PreviousSetRow>(
    `SELECT s.setNumber, s.weight, s.reps, s.durationSeconds
     FROM set_logs s
     WHERE s.exerciseLogId = (
       SELECT el.id FROM exercise_logs el
       JOIN workout_logs wl ON wl.id = el.workoutLogId
       WHERE el.exerciseTemplateId = ?
         AND wl.endedAt IS NOT NULL
       ORDER BY wl.endedAt DESC
       LIMIT 1
     )
       AND s.completed = 1
     ORDER BY s.setNumber ASC;`,
    [exerciseTemplateId]
  );
}
