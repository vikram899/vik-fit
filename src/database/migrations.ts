export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'other')),
    height REAL NOT NULL,
    weight REAL NOT NULL,
    activityLevel TEXT NOT NULL CHECK(activityLevel IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal TEXT NOT NULL CHECK(goal IN ('lose_weight', 'maintain', 'gain_muscle')),
    unitPreference TEXT NOT NULL DEFAULT 'metric' CHECK(unitPreference IN ('metric', 'imperial')),
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`;

export const CREATE_MEAL_TEMPLATES_TABLE = `
  CREATE TABLE IF NOT EXISTS meal_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    calories REAL NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('breakfast', 'lunch', 'dinner', 'snack')),
    isFavorite INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`;

export const CREATE_MEAL_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS meal_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    templateId INTEGER REFERENCES meal_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    calories REAL NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('breakfast', 'lunch', 'dinner', 'snack')),
    eatenAt TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`;

export const CREATE_EXERCISE_TEMPLATES_TABLE = `
  CREATE TABLE IF NOT EXISTS exercise_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('strength', 'bodyweight', 'cardio', 'flexibility', 'endurance', 'hiit', 'warmup', 'other')),
    targetMuscle TEXT NOT NULL,
    secondaryMuscle TEXT,
    isFavorite INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`;

export const CREATE_WORKOUT_TEMPLATES_TABLE = `
  CREATE TABLE IF NOT EXISTS workout_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    assignedWeekday INTEGER CHECK(assignedWeekday >= 0 AND assignedWeekday <= 6),
    isFavorite INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`;

export const CREATE_WORKOUT_TEMPLATE_EXERCISES_TABLE = `
  CREATE TABLE IF NOT EXISTS workout_template_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workoutTemplateId INTEGER NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    exerciseTemplateId INTEGER NOT NULL REFERENCES exercise_templates(id) ON DELETE CASCADE,
    orderIndex INTEGER NOT NULL DEFAULT 0,
    defaultSets INTEGER NOT NULL DEFAULT 3,
    defaultReps INTEGER NOT NULL DEFAULT 10,
    defaultWeight REAL NOT NULL DEFAULT 0,
    defaultRestTimeSeconds INTEGER NOT NULL DEFAULT 60
  );
`;

export const CREATE_WORKOUT_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS workout_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workoutTemplateId INTEGER REFERENCES workout_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    startedAt TEXT NOT NULL,
    endedAt TEXT,
    durationSeconds INTEGER,
    notes TEXT,
    createdAt TEXT NOT NULL
  );
`;

export const CREATE_EXERCISE_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS exercise_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workoutLogId INTEGER NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
    exerciseTemplateId INTEGER NOT NULL REFERENCES exercise_templates(id) ON DELETE CASCADE,
    orderIndex INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  );
`;

export const CREATE_SET_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS set_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exerciseLogId INTEGER NOT NULL REFERENCES exercise_logs(id) ON DELETE CASCADE,
    setNumber INTEGER NOT NULL,
    reps INTEGER,
    weight REAL,
    durationSeconds INTEGER,
    completed INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  );
`;

export const CREATE_WORKOUT_SKIPS_TABLE = `
  CREATE TABLE IF NOT EXISTS workout_skips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workoutTemplateId INTEGER NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    skipDate TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    UNIQUE(workoutTemplateId, skipDate)
  );
`;

export const ADD_TARGET_WEIGHT_COLUMN = `ALTER TABLE users ADD COLUMN targetWeight REAL;`;
export const ADD_EXPERIENCE_LEVEL_COLUMN = `ALTER TABLE users ADD COLUMN experienceLevel TEXT;`;
export const ADD_CUSTOM_NUTRITION_COLUMNS = `ALTER TABLE users ADD COLUMN targetCaloriesOverride REAL;`;
export const ADD_CUSTOM_PROTEIN_COLUMN = `ALTER TABLE users ADD COLUMN targetProteinOverride REAL;`;
export const ADD_STREAK_CONDITION_COLUMN = `ALTER TABLE users ADD COLUMN streakCondition TEXT NOT NULL DEFAULT 'any';`;
export const ADD_GOAL_THRESHOLDS_COLUMNS      = `ALTER TABLE users ADD COLUMN calorieGoalPct INTEGER NOT NULL DEFAULT 85;`;
export const ADD_PROTEIN_GOAL_PCT_COLUMN       = `ALTER TABLE users ADD COLUMN proteinGoalPct INTEGER NOT NULL DEFAULT 85;`;
export const ADD_CALORIE_GOAL_UPPER_PCT_COLUMN = `ALTER TABLE users ADD COLUMN calorieGoalUpperPct INTEGER NOT NULL DEFAULT 115;`;
export const ADD_ASSIGNED_WEEKDAYS_COLUMN = `ALTER TABLE workout_templates ADD COLUMN assignedWeekdays TEXT;`;
export const MIGRATE_ASSIGNED_WEEKDAYS = `UPDATE workout_templates SET assignedWeekdays = '[' || assignedWeekday || ']' WHERE assignedWeekday IS NOT NULL;`;

// Rebuild exercise_templates to fix the CHECK constraint — old installs had a narrower
// type list that excluded bodyweight, hiit, etc. SQLite can't ALTER a CHECK constraint
// so we recreate the table while preserving all data.
// Foreign keys must be OFF while we drop + rename tables.
export const REBUILD_EXERCISE_TEMPLATES_TABLE = `
  PRAGMA foreign_keys = OFF;
  DROP TABLE IF EXISTS exercise_templates_new;
  CREATE TABLE exercise_templates_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('strength', 'bodyweight', 'cardio', 'flexibility', 'endurance', 'hiit', 'warmup', 'other')),
    targetMuscle TEXT NOT NULL,
    secondaryMuscle TEXT,
    isFavorite INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
  INSERT INTO exercise_templates_new SELECT * FROM exercise_templates;
  DROP TABLE exercise_templates;
  ALTER TABLE exercise_templates_new RENAME TO exercise_templates;
  PRAGMA foreign_keys = ON;
`;

export const CREATE_WEIGHT_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS weight_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weight REAL NOT NULL,
    note TEXT,
    loggedAt TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`;

export const CREATE_PR_TRACKED_EXERCISES_TABLE = `
  CREATE TABLE IF NOT EXISTS pr_tracked_exercises (
    exerciseTemplateId INTEGER PRIMARY KEY,
    addedAt TEXT NOT NULL
  );
`;

// Re-apply threshold columns at new indices so existing users whose migration
// tracker skipped indices 16–18 (due to a prior index shift) still get them.
// ALTER TABLE ADD COLUMN fails silently if the column already exists.
export const ENSURE_CALORIE_GOAL_PCT_COLUMN      = `ALTER TABLE users ADD COLUMN calorieGoalPct INTEGER NOT NULL DEFAULT 85;`;
export const ENSURE_CALORIE_GOAL_UPPER_PCT_COLUMN = `ALTER TABLE users ADD COLUMN calorieGoalUpperPct INTEGER NOT NULL DEFAULT 115;`;
export const ENSURE_PROTEIN_GOAL_PCT_COLUMN       = `ALTER TABLE users ADD COLUMN proteinGoalPct INTEGER NOT NULL DEFAULT 85;`;

// DEFAULT 1 = existing users are considered to have already seen the tour.
// New users get hasSeenTour = 0 explicitly in createUser.
export const ADD_HAS_SEEN_TOUR_COLUMN = `ALTER TABLE users ADD COLUMN hasSeenTour INTEGER NOT NULL DEFAULT 1;`;

export const ADD_RESTING_CALORIES_COLUMN = `ALTER TABLE users ADD COLUMN restingCaloriesOverride INTEGER;`;

export const CREATE_STEPS_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS steps_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    steps INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`;

export const ADD_ACTIVE_BURNED_COLUMN = `ALTER TABLE steps_logs ADD COLUMN activeBurned INTEGER NOT NULL DEFAULT 0;`;

export const ALL_MIGRATIONS = [
  CREATE_USERS_TABLE,
  CREATE_MEAL_TEMPLATES_TABLE,
  CREATE_MEAL_LOGS_TABLE,
  CREATE_EXERCISE_TEMPLATES_TABLE,
  CREATE_WORKOUT_TEMPLATES_TABLE,
  CREATE_WORKOUT_TEMPLATE_EXERCISES_TABLE,
  CREATE_WORKOUT_LOGS_TABLE,
  CREATE_EXERCISE_LOGS_TABLE,
  CREATE_SET_LOGS_TABLE,
  CREATE_WORKOUT_SKIPS_TABLE,
  ADD_TARGET_WEIGHT_COLUMN,
  ADD_EXPERIENCE_LEVEL_COLUMN,
  ADD_CUSTOM_NUTRITION_COLUMNS,
  ADD_CUSTOM_PROTEIN_COLUMN,
  CREATE_WEIGHT_LOGS_TABLE,
  ADD_STREAK_CONDITION_COLUMN,
  ADD_GOAL_THRESHOLDS_COLUMNS,
  ADD_PROTEIN_GOAL_PCT_COLUMN,
  ADD_CALORIE_GOAL_UPPER_PCT_COLUMN,
  ADD_ASSIGNED_WEEKDAYS_COLUMN,
  MIGRATE_ASSIGNED_WEEKDAYS,
  REBUILD_EXERCISE_TEMPLATES_TABLE,
  CREATE_PR_TRACKED_EXERCISES_TABLE,
  ENSURE_CALORIE_GOAL_PCT_COLUMN,
  ENSURE_CALORIE_GOAL_UPPER_PCT_COLUMN,
  ENSURE_PROTEIN_GOAL_PCT_COLUMN,
  ADD_HAS_SEEN_TOUR_COLUMN,
  ADD_RESTING_CALORIES_COLUMN,
  CREATE_STEPS_LOGS_TABLE,
  ADD_ACTIVE_BURNED_COLUMN,
];
