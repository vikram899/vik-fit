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

export interface StrengthComparisonRow {
  exerciseName: string;
  exerciseType: string;
  currentMax: number;
  previousMax: number | null;
}

/**
 * For the top exercises in the current period, also fetch their max in the
 * previous same-length period so we can show progress deltas.
 * currentFrom  = start of current period (e.g. 7 days ago)
 * previousFrom = start of previous period (e.g. 14 days ago)
 */
export async function getStrengthComparison(
  currentFrom: string,
  previousFrom: string,
  limit = 6
): Promise<StrengthComparisonRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<StrengthComparisonRow>(
    `SELECT et.name AS exerciseName,
            et.type AS exerciseType,
            MAX(CASE WHEN date(wl.endedAt) >= ? THEN sl.weight ELSE NULL END) AS currentMax,
            MAX(CASE WHEN date(wl.endedAt) >= ? AND date(wl.endedAt) < ? THEN sl.weight ELSE NULL END) AS previousMax
     FROM set_logs sl
     JOIN exercise_logs el ON sl.exerciseLogId = el.id
     JOIN workout_logs wl  ON el.workoutLogId  = wl.id
     JOIN exercise_templates et ON el.exerciseTemplateId = et.id
     WHERE sl.completed = 1
       AND sl.weight > 0
       AND wl.endedAt IS NOT NULL
       AND date(wl.endedAt) >= ?
     GROUP BY et.id, et.name, et.type
     HAVING currentMax IS NOT NULL
     ORDER BY currentMax DESC
     LIMIT ?;`,
    [currentFrom, previousFrom, currentFrom, previousFrom, limit]
  );
}

// ── Personal Records ───────────────────────────────────────────────────────

export interface PersonalRecordRow {
  exerciseName: string;
  exerciseType: string;
  maxWeight: number | null;
  maxReps: number | null;
  maxDuration: number | null;
  achievedAt: string;
}

/** All-time best per exercise across all types, ordered by most recently achieved */
export async function getPersonalRecords(limit = 10, exerciseTemplateIds?: number[]): Promise<PersonalRecordRow[]> {
  const db = await getDatabase();
  const filterClause = exerciseTemplateIds && exerciseTemplateIds.length > 0
    ? `AND el.exerciseTemplateId IN (${exerciseTemplateIds.map(() => '?').join(',')})`
    : '';
  const filterValues = exerciseTemplateIds && exerciseTemplateIds.length > 0 ? exerciseTemplateIds : [];
  const limitClause = exerciseTemplateIds && exerciseTemplateIds.length > 0 ? '' : 'LIMIT ?';
  const limitValues = exerciseTemplateIds && exerciseTemplateIds.length > 0 ? [] : [limit];
  return db.getAllAsync<PersonalRecordRow>(
    `SELECT et.name               AS exerciseName,
            et.type               AS exerciseType,
            MAX(sl.weight)        AS maxWeight,
            MAX(sl.reps)          AS maxReps,
            MAX(sl.durationSeconds) AS maxDuration,
            MAX(wl.endedAt)       AS achievedAt
     FROM set_logs sl
     JOIN exercise_logs el ON sl.exerciseLogId = el.id
     JOIN workout_logs wl  ON el.workoutLogId  = wl.id
     JOIN exercise_templates et ON el.exerciseTemplateId = et.id
     WHERE sl.completed = 1 AND wl.endedAt IS NOT NULL ${filterClause}
     GROUP BY et.id, et.name, et.type
     HAVING MAX(sl.weight) > 0 OR MAX(sl.reps) > 0 OR MAX(sl.durationSeconds) > 0
     ORDER BY achievedAt DESC
     ${limitClause};`,
    [...filterValues, ...limitValues]
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

export interface WorkoutDatePoint {
  date: string;  // 'YYYY-MM-DD'
  count: number;
}

/** Completed workouts grouped by day, on or after fromDate */
export async function getWorkoutDatesForPeriod(fromDate: string): Promise<WorkoutDatePoint[]> {
  const db = await getDatabase();
  return db.getAllAsync<WorkoutDatePoint>(
    `SELECT date(endedAt) AS date, COUNT(*) AS count
     FROM workout_logs
     WHERE endedAt IS NOT NULL AND date(endedAt) >= ?
     GROUP BY date(endedAt)
     ORDER BY date ASC;`,
    [fromDate]
  );
}

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

// ── Meal totals for period ─────────────────────────────────────────────────

export interface DailyMealPoint {
  date: string;          // 'YYYY-MM-DD'
  totalCalories: number;
  totalProtein: number;
}

/** Daily calorie + protein totals on or after fromDate */
export async function getDailyMealTotalsForPeriod(fromDate: string): Promise<DailyMealPoint[]> {
  const db = await getDatabase();
  return db.getAllAsync<DailyMealPoint>(
    `SELECT date(eatenAt) as date,
            SUM(calories) as totalCalories,
            SUM(protein)  as totalProtein
     FROM meal_logs
     WHERE date(eatenAt) >= ?
     GROUP BY date(eatenAt)
     ORDER BY date(eatenAt) ASC;`,
    [fromDate]
  );
}

// ── Strength time series ───────────────────────────────────────────────────

export interface StrengthDailyPoint {
  date: string;         // 'YYYY-MM-DD'
  maxWeight: number;
  exerciseName: string;
}

/**
 * For the top exercise by max weight in the period, returns its max weight
 * per day worked out — used to build a time-series strength chart.
 */
export async function getTopExerciseDailyMax(fromDate: string): Promise<StrengthDailyPoint[]> {
  const db = await getDatabase();
  return db.getAllAsync<StrengthDailyPoint>(
    `SELECT date(wl.endedAt) AS date, MAX(sl.weight) AS maxWeight, et.name AS exerciseName
     FROM set_logs sl
     JOIN exercise_logs el  ON sl.exerciseLogId   = el.id
     JOIN workout_logs wl   ON el.workoutLogId     = wl.id
     JOIN exercise_templates et ON el.exerciseTemplateId = et.id
     WHERE sl.completed = 1
       AND sl.weight > 0
       AND wl.endedAt IS NOT NULL
       AND date(wl.endedAt) >= ?
       AND et.id = (
         SELECT et2.id
         FROM set_logs sl2
         JOIN exercise_logs el2  ON sl2.exerciseLogId   = el2.id
         JOIN workout_logs wl2   ON el2.workoutLogId     = wl2.id
         JOIN exercise_templates et2 ON el2.exerciseTemplateId = et2.id
         WHERE sl2.completed = 1 AND sl2.weight > 0
           AND wl2.endedAt IS NOT NULL AND date(wl2.endedAt) >= ?
         GROUP BY et2.id
         ORDER BY MAX(sl2.weight) DESC
         LIMIT 1
       )
     GROUP BY date(wl.endedAt)
     ORDER BY date ASC;`,
    [fromDate, fromDate]
  );
}

/** All workout templates with their assignedWeekdays JSON for consistency calculation */
export async function getTemplatesForConsistency(): Promise<{ assignedWeekdays: string | null }[]> {
  const db = await getDatabase();
  return db.getAllAsync<{ assignedWeekdays: string | null }>(
    `SELECT assignedWeekdays FROM workout_templates;`
  );
}

// ── Strength screen ─────────────────────────────────────────────────────────

export interface ExerciseChipData {
  exerciseTemplateId: number;
  exerciseName: string;
  exerciseType: string;
}

/** All exercises that have at least one completed set in the period, ordered by session count desc */
export async function getExercisesInPeriod(fromDate: string): Promise<ExerciseChipData[]> {
  const db = await getDatabase();
  return db.getAllAsync<ExerciseChipData>(
    `SELECT et.id AS exerciseTemplateId, et.name AS exerciseName, et.type AS exerciseType
     FROM set_logs sl
     JOIN exercise_logs el ON sl.exerciseLogId = el.id
     JOIN workout_logs wl  ON el.workoutLogId  = wl.id
     JOIN exercise_templates et ON el.exerciseTemplateId = et.id
     WHERE sl.completed = 1 AND wl.endedAt IS NOT NULL AND date(wl.endedAt) >= ?
     GROUP BY et.id, et.name, et.type
     ORDER BY COUNT(DISTINCT date(wl.endedAt)) DESC, et.name ASC;`,
    [fromDate]
  );
}

export interface ExerciseSessionPoint {
  date: string;         // 'YYYY-MM-DD'
  estimated1RM: number; // weight*(1+reps/30) — 0 if no weight data
  maxWeight: number;
  maxReps: number;
  maxDuration: number;  // seconds
}

/** Per-session best values for a single exercise in the period */
export async function getExerciseSessionPoints(
  exerciseTemplateId: number,
  fromDate: string
): Promise<ExerciseSessionPoint[]> {
  const db = await getDatabase();
  return db.getAllAsync<ExerciseSessionPoint>(
    `SELECT
       date(wl.endedAt) AS date,
       MAX(CASE WHEN sl.weight > 0 AND sl.reps > 0
           THEN sl.weight * (1.0 + sl.reps / 30.0) ELSE 0 END) AS estimated1RM,
       MAX(COALESCE(sl.weight, 0))          AS maxWeight,
       MAX(COALESCE(sl.reps, 0))            AS maxReps,
       MAX(COALESCE(sl.durationSeconds, 0)) AS maxDuration
     FROM set_logs sl
     JOIN exercise_logs el ON sl.exerciseLogId = el.id
     JOIN workout_logs wl  ON el.workoutLogId  = wl.id
     WHERE sl.completed = 1
       AND el.exerciseTemplateId = ?
       AND wl.endedAt IS NOT NULL
       AND date(wl.endedAt) >= ?
     GROUP BY date(wl.endedAt)
     ORDER BY date ASC;`,
    [exerciseTemplateId, fromDate]
  );
}
