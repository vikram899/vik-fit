import { getDatabase } from '../db';

// --- Workout Templates ---

export interface WorkoutTemplateRow {
  id: number;
  name: string;
  description: string | null;
  assignedWeekday: number | null; // 0=Sun, 1=Mon ... 6=Sat
  isFavorite: number; // 0 | 1
  createdAt: string;
  updatedAt: string;
}

export type CreateWorkoutTemplateInput = Omit<WorkoutTemplateRow, 'id'>;
export type UpdateWorkoutTemplateInput = Partial<Omit<WorkoutTemplateRow, 'id' | 'createdAt'>>;

export interface WorkoutTemplateExerciseRow {
  id: number;
  workoutTemplateId: number;
  exerciseTemplateId: number;
  orderIndex: number;
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  defaultRestTimeSeconds: number;
}

export type CreateWorkoutTemplateExerciseInput = Omit<WorkoutTemplateExerciseRow, 'id'>;

export async function getAllWorkoutTemplates(): Promise<WorkoutTemplateRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<WorkoutTemplateRow>(
    'SELECT * FROM workout_templates ORDER BY assignedWeekday ASC, name ASC;'
  );
}

export interface WorkoutTemplateWithCountRow extends WorkoutTemplateRow {
  exerciseCount: number;
}

export async function getAllWorkoutTemplatesWithCounts(): Promise<WorkoutTemplateWithCountRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<WorkoutTemplateWithCountRow>(
    `SELECT wt.*, COUNT(wte.id) as exerciseCount
     FROM workout_templates wt
     LEFT JOIN workout_template_exercises wte ON wte.workoutTemplateId = wt.id
     GROUP BY wt.id
     ORDER BY wt.assignedWeekday ASC, wt.name ASC;`
  );
}

export async function getWorkoutTemplateByWeekday(weekday: number): Promise<WorkoutTemplateRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<WorkoutTemplateRow>(
    'SELECT * FROM workout_templates WHERE assignedWeekday = ? LIMIT 1;',
    [weekday]
  );
  return result ?? null;
}

export async function getWorkoutTemplatesByWeekday(weekday: number): Promise<WorkoutTemplateRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<WorkoutTemplateRow>(
    'SELECT * FROM workout_templates WHERE assignedWeekday = ? ORDER BY name ASC;',
    [weekday]
  );
}

export async function getWorkoutTemplateById(id: number): Promise<WorkoutTemplateRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<WorkoutTemplateRow>(
    'SELECT * FROM workout_templates WHERE id = ?;',
    [id]
  );
  return result ?? null;
}

export async function createWorkoutTemplate(input: CreateWorkoutTemplateInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO workout_templates (name, description, assignedWeekday, isFavorite, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      input.name,
      input.description ?? null,
      input.assignedWeekday ?? null,
      input.isFavorite,
      input.createdAt,
      input.updatedAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateWorkoutTemplate(id: number, input: UpdateWorkoutTemplateInput): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const fields = Object.keys(input) as (keyof UpdateWorkoutTemplateInput)[];
  const setClauses = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => input[f]);

  await db.runAsync(
    `UPDATE workout_templates SET ${setClauses}, updatedAt = ? WHERE id = ?;`,
    [...values, now, id]
  );
}

export async function deleteWorkoutTemplate(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM workout_templates WHERE id = ?;', [id]);
}

export async function toggleWorkoutFavorite(id: number, isFavorite: boolean): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE workout_templates SET isFavorite = ?, updatedAt = ? WHERE id = ?;',
    [isFavorite ? 1 : 0, now, id]
  );
}

// --- Workout Template Exercises ---

export async function getWorkoutTemplateExercises(
  workoutTemplateId: number
): Promise<WorkoutTemplateExerciseRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<WorkoutTemplateExerciseRow>(
    'SELECT * FROM workout_template_exercises WHERE workoutTemplateId = ? ORDER BY orderIndex ASC;',
    [workoutTemplateId]
  );
}

export interface WorkoutTemplateExerciseWithName extends WorkoutTemplateExerciseRow {
  exerciseName: string;
  exerciseType: 'strength' | 'cardio';
}

export async function getWorkoutTemplateExercisesWithNames(
  workoutTemplateId: number
): Promise<WorkoutTemplateExerciseWithName[]> {
  const db = await getDatabase();
  return db.getAllAsync<WorkoutTemplateExerciseWithName>(
    `SELECT wte.*, et.name AS exerciseName, et.type AS exerciseType
     FROM workout_template_exercises wte
     JOIN exercise_templates et ON et.id = wte.exerciseTemplateId
     WHERE wte.workoutTemplateId = ?
     ORDER BY wte.orderIndex ASC;`,
    [workoutTemplateId]
  );
}

export async function addExerciseToTemplate(
  input: CreateWorkoutTemplateExerciseInput
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO workout_template_exercises
      (workoutTemplateId, exerciseTemplateId, orderIndex, defaultSets, defaultReps, defaultWeight, defaultRestTimeSeconds)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      input.workoutTemplateId,
      input.exerciseTemplateId,
      input.orderIndex,
      input.defaultSets,
      input.defaultReps,
      input.defaultWeight,
      input.defaultRestTimeSeconds,
    ]
  );
  return result.lastInsertRowId;
}

export async function removeExerciseFromTemplate(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM workout_template_exercises WHERE id = ?;', [id]);
}

export async function updateExerciseOrderInTemplate(id: number, orderIndex: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE workout_template_exercises SET orderIndex = ? WHERE id = ?;',
    [orderIndex, id]
  );
}

// --- Workout Logs ---

export interface WorkoutLogRow {
  id: number;
  workoutTemplateId: number | null;
  name: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  notes: string | null;
  createdAt: string;
}

export type CreateWorkoutLogInput = Omit<WorkoutLogRow, 'id'>;

export async function createWorkoutLog(input: CreateWorkoutLogInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO workout_logs (workoutTemplateId, name, startedAt, endedAt, durationSeconds, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      input.workoutTemplateId ?? null,
      input.name,
      input.startedAt,
      input.endedAt ?? null,
      input.durationSeconds ?? null,
      input.notes ?? null,
      input.createdAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateWorkoutLog(
  id: number,
  input: Partial<Pick<WorkoutLogRow, 'endedAt' | 'durationSeconds' | 'notes'>>
): Promise<void> {
  const db = await getDatabase();
  const fields = Object.keys(input) as (keyof typeof input)[];
  const setClauses = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => input[f]);

  await db.runAsync(
    `UPDATE workout_logs SET ${setClauses} WHERE id = ?;`,
    [...values, id]
  );
}

export async function getWorkoutLogById(id: number): Promise<WorkoutLogRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<WorkoutLogRow>(
    'SELECT * FROM workout_logs WHERE id = ?;',
    [id]
  );
  return result ?? null;
}

export async function getWorkoutLogsByDate(dateStr: string): Promise<WorkoutLogRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<WorkoutLogRow>(
    `SELECT * FROM workout_logs WHERE date(startedAt) = ? ORDER BY startedAt DESC;`,
    [dateStr]
  );
}

export async function getLastWorkoutLogForTemplate(workoutTemplateId: number): Promise<WorkoutLogRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<WorkoutLogRow>(
    'SELECT * FROM workout_logs WHERE workoutTemplateId = ? AND endedAt IS NOT NULL ORDER BY endedAt DESC LIMIT 1;',
    [workoutTemplateId]
  );
  return result ?? null;
}

export async function getRecentWorkoutLogs(limit: number = 10): Promise<WorkoutLogRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<WorkoutLogRow>(
    'SELECT * FROM workout_logs WHERE endedAt IS NOT NULL ORDER BY startedAt DESC LIMIT ?;',
    [limit]
  );
}

// --- Workout Progress ---

export async function getWorkoutProgressForDate(
  workoutTemplateId: number,
  dateStr: string
): Promise<{ exerciseCount: number; completedCount: number }> {
  const db = await getDatabase();
  const [totalResult, doneResult] = await Promise.all([
    db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM workout_template_exercises WHERE workoutTemplateId = ?;',
      [workoutTemplateId]
    ),
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(DISTINCT el.exerciseTemplateId) as count
       FROM exercise_logs el
       JOIN workout_logs wl ON el.workoutLogId = wl.id
       WHERE wl.workoutTemplateId = ? AND date(wl.startedAt) = ?;`,
      [workoutTemplateId, dateStr]
    ),
  ]);
  return {
    exerciseCount: totalResult?.count ?? 0,
    completedCount: doneResult?.count ?? 0,
  };
}

// --- Workout Skips ---

export async function skipWorkoutForDate(workoutTemplateId: number, dateStr: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT OR IGNORE INTO workout_skips (workoutTemplateId, skipDate, createdAt) VALUES (?, ?, ?);',
    [workoutTemplateId, dateStr, now]
  );
}

export async function getSkippedWorkoutIdsForDate(dateStr: string): Promise<number[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ workoutTemplateId: number }>(
    'SELECT workoutTemplateId FROM workout_skips WHERE skipDate = ?;',
    [dateStr]
  );
  return rows.map((r) => r.workoutTemplateId);
}

export async function getWorkoutCompletedDates(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ d: string }>(
    'SELECT DISTINCT date(startedAt) as d FROM workout_logs WHERE endedAt IS NOT NULL ORDER BY d DESC;'
  );
  return rows.map((r) => r.d);
}
