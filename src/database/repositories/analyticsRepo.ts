import { getDatabase } from '../db';

// ── Weight ─────────────────────────────────────────────────────────────────

export interface WeightLogPoint {
  date: string;   // 'YYYY-MM-DD'
  weight: number;
}

/** All weight logs on or after fromDate, ordered oldest→newest */
export async function getWeightLogsForPeriod(fromDate: string): Promise<WeightLogPoint[]> {
  const db = await getDatabase();
  return db.getAllAsync<WeightLogPoint>(
    `SELECT date(loggedAt) as date, weight
     FROM weight_logs
     WHERE date(loggedAt) >= ?
     ORDER BY loggedAt ASC;`,
    [fromDate]
  );
}

// ── Calories ───────────────────────────────────────────────────────────────

export interface DailyCaloriesPoint {
  date: string;          // 'YYYY-MM-DD'
  totalCalories: number;
}

/** Daily calorie totals on or after fromDate, ordered oldest→newest */
export async function getDailyCaloriesForPeriod(fromDate: string): Promise<DailyCaloriesPoint[]> {
  const db = await getDatabase();
  return db.getAllAsync<DailyCaloriesPoint>(
    `SELECT date(eatenAt) as date, SUM(calories) as totalCalories
     FROM meal_logs
     WHERE date(eatenAt) >= ?
     GROUP BY date(eatenAt)
     ORDER BY date(eatenAt) ASC;`,
    [fromDate]
  );
}

// ── Strength ───────────────────────────────────────────────────────────────

export interface ExerciseMaxWeightRow {
  exerciseName: string;
  maxWeight: number;
}

/** Top exercises by max weight (from completed sets) in the period */
export async function getTopExerciseMaxWeights(
  fromDate: string,
  limit = 5
): Promise<ExerciseMaxWeightRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<ExerciseMaxWeightRow>(
    `SELECT et.name as exerciseName, MAX(sl.weight) as maxWeight
     FROM set_logs sl
     JOIN exercise_logs el ON sl.exerciseLogId = el.id
     JOIN workout_logs wl ON el.workoutLogId = wl.id
     JOIN exercise_templates et ON el.exerciseTemplateId = et.id
     WHERE sl.completed = 1
       AND sl.weight > 0
       AND wl.endedAt IS NOT NULL
       AND wl.endedAt >= ?
     GROUP BY et.id, et.name
     ORDER BY maxWeight DESC
     LIMIT ?;`,
    [fromDate, limit]
  );
}

// ── Personal Records ───────────────────────────────────────────────────────

export interface PersonalRecordRow {
  exerciseName: string;
  maxWeight: number;
  achievedAt: string; // ISO datetime of the workout where PR was set
}

/** All-time max weight per exercise, ordered by most recently achieved */
export async function getPersonalRecords(limit = 5): Promise<PersonalRecordRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<PersonalRecordRow>(
    `SELECT et.name as exerciseName,
            MAX(sl.weight) as maxWeight,
            MAX(wl.endedAt) as achievedAt
     FROM set_logs sl
     JOIN exercise_logs el ON sl.exerciseLogId = el.id
     JOIN workout_logs wl ON el.workoutLogId = wl.id
     JOIN exercise_templates et ON el.exerciseTemplateId = et.id
     WHERE sl.completed = 1 AND sl.weight > 0 AND wl.endedAt IS NOT NULL
     GROUP BY et.id, et.name
     ORDER BY maxWeight DESC
     LIMIT ?;`,
    [limit]
  );
}

// ── Goal Calendar ──────────────────────────────────────────────────────────

export interface DailyMealTotalsRow {
  date: string;          // 'YYYY-MM-DD'
  totalCalories: number;
  totalProtein: number;
}

/** Daily calorie + protein totals for a given year-month (e.g. '2026-03') */
export async function getDailyMealTotalsForMonth(
  yearMonth: string
): Promise<DailyMealTotalsRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<DailyMealTotalsRow>(
    `SELECT date(eatenAt) as date,
            SUM(calories) as totalCalories,
            SUM(protein)  as totalProtein
     FROM meal_logs
     WHERE strftime('%Y-%m', eatenAt) = ?
     GROUP BY date(eatenAt)
     ORDER BY date(eatenAt) ASC;`,
    [yearMonth]
  );
}

/** Set of 'YYYY-MM-DD' dates that have at least one completed workout */
export async function getCompletedWorkoutDatesForMonth(
  yearMonth: string
): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string }>(
    `SELECT DISTINCT date(endedAt) as date
     FROM workout_logs
     WHERE endedAt IS NOT NULL
       AND strftime('%Y-%m', endedAt) = ?
     ORDER BY date ASC;`,
    [yearMonth]
  );
  return rows.map(r => r.date);
}

// ── Workouts ───────────────────────────────────────────────────────────────

/** Count of completed workouts on or after fromDate */
export async function getCompletedWorkoutCount(fromDate: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM workout_logs
     WHERE endedAt IS NOT NULL AND endedAt >= ?;`,
    [fromDate]
  );
  return row?.count ?? 0;
}
