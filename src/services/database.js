import * as SQLite from 'expo-sqlite';

// Open or create database
const db = SQLite.openDatabaseSync('vikfit.db');

/**
 * Initialize database - create tables if they don't exist
 */
export const initializeDatabase = async () => {
  try {
    // Re-enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Create workouts table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create exercises table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workoutId INTEGER NOT NULL,
        name TEXT NOT NULL,
        sets INTEGER,
        reps INTEGER,
        weight REAL,
        restTime INTEGER,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE
      );
    `);

    // Migration: Rename planId to workoutId in exercises table
    try {
      // Check if the old column exists
      const tableInfo = await db.getAllAsync("PRAGMA table_info(exercises)");
      const hasOldColumn = tableInfo.some(col => col.name === 'planId');
      const hasNewColumn = tableInfo.some(col => col.name === 'workoutId');

      if (hasOldColumn && !hasNewColumn) {
        // SQLite doesn't support direct column rename, so we need to recreate the table
        await db.execAsync(`
          BEGIN TRANSACTION;

          -- Create new table with correct schema
          CREATE TABLE exercises_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workoutId INTEGER NOT NULL,
            name TEXT NOT NULL,
            sets INTEGER,
            reps INTEGER,
            weight REAL,
            restTime INTEGER,
            notes TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE
          );

          -- Copy data from old table
          INSERT INTO exercises_new (id, workoutId, name, sets, reps, weight, restTime, notes, createdAt)
          SELECT id, planId, name, sets, reps, weight, restTime, notes, createdAt FROM exercises;

          -- Drop old table
          DROP TABLE exercises;

          -- Rename new table
          ALTER TABLE exercises_new RENAME TO exercises;

          COMMIT;
        `);
        console.log('Migration completed: Renamed planId to workoutId in exercises table');
      }
    } catch (error) {
      console.error('Migration error for exercises table:', error);
      // Continue anyway, table might already be migrated
    }

    // Migration: Add restTime column if it doesn't exist (renamed from time)
    try {
      await db.execAsync('ALTER TABLE exercises ADD COLUMN restTime INTEGER DEFAULT 0;');
    } catch (error) {
      // Column already exists, no need to add it
    }

    // Migration: Add mealType column to meal_logs if it doesn't exist
    try {
      await db.execAsync('ALTER TABLE meal_logs ADD COLUMN mealType TEXT DEFAULT "Breakfast";');
    } catch (error) {
      // Column already exists, no need to add it
    }

    // Migration: Add isFavorite column to meals table if it doesn't exist
    try {
      await db.execAsync('ALTER TABLE meals ADD COLUMN isFavorite INTEGER DEFAULT 0;');
    } catch (error) {
      // Column already exists, no need to add it
    }

    // Migration: Add targetBodyParts column to exercises table if it doesn't exist
    try {
      await db.execAsync('ALTER TABLE exercises ADD COLUMN targetBodyParts TEXT;');
    } catch (error) {
      // Column already exists, no need to add it
    }

    // Migration: Add mealType column to meals table if it doesn't exist
    try {
      await db.execAsync('ALTER TABLE meals ADD COLUMN mealType TEXT DEFAULT "veg";');
    } catch (error) {
      // Column already exists, no need to add it
    }

    // Migration: Update default workout exercises with target body parts
    try {
      // Chest Day exercises
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Chest', 'Triceps']), 'Bench Press']
      );
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Chest', 'Shoulders']), 'Incline Dumbbell Press']
      );
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Triceps', 'Chest']), 'Tricep Dips']
      );
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Chest']), 'Chest Fly']
      );

      // Leg Day exercises
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Quadriceps', 'Hamstrings', 'Glutes']), 'Squats']
      );
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Quadriceps', 'Glutes']), 'Leg Press']
      );
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Hamstrings']), 'Leg Curl']
      );
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Quadriceps']), 'Leg Extension']
      );
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Calves']), 'Calf Raises']
      );

      // Back & Biceps exercises
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Back', 'Hamstrings', 'Glutes']), 'Deadlift']
      );
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Back', 'Biceps']), 'Barbell Row']
      );
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Biceps']), 'Barbell Curl']
      );
      await db.runAsync(
        'UPDATE exercises SET targetBodyParts = ? WHERE name = ? AND targetBodyParts IS NULL',
        [JSON.stringify(['Back', 'Biceps']), 'Lat Pulldown']
      );
    } catch (error) {
      // Migration already applied or exercises don't exist
    }

    // Migration: Add weight column to meals table if it doesn't exist
    try {
      await db.execAsync('ALTER TABLE meals ADD COLUMN weight REAL DEFAULT 0;');
    } catch (error) {
      // Column already exists, no need to add it
    }

    // Create meals table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        calories REAL,
        protein REAL,
        carbs REAL,
        fats REAL,
        isFavorite INTEGER DEFAULT 0,
        mealType TEXT DEFAULT "veg",
        weight REAL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create meal_logs table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mealId INTEGER NOT NULL,
        mealDate TEXT NOT NULL,
        calories REAL,
        protein REAL,
        carbs REAL,
        fats REAL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mealId) REFERENCES meals(id) ON DELETE CASCADE
      );
    `);

    // Create macro_goals table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS macro_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goalDate TEXT UNIQUE,
        calorieGoal REAL,
        proteinGoal REAL,
        carbsGoal REAL,
        fatsGoal REAL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create weight_tracking table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS weight_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weightDate TEXT NOT NULL,
        currentWeight REAL NOT NULL,
        targetWeight REAL NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(weightDate)
      );
    `);

    // Create workout_schedule table for assigning workouts to days of week
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workoutId INTEGER NOT NULL,
        dayOfWeek INTEGER NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE,
        UNIQUE(workoutId, dayOfWeek)
      );
    `);

    // Create workout_execution table for tracking workout completion
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_execution (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workoutId INTEGER NOT NULL,
        executionDate TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        completedAt TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE,
        UNIQUE(workoutId, executionDate)
      );
    `);

    // Create workout_logs table for tracking workout sessions
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workoutId INTEGER NOT NULL,
        logDate TEXT NOT NULL,
        status TEXT DEFAULT 'in_progress',
        totalDurationSeconds INTEGER DEFAULT 0,
        startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completedAt TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE,
        UNIQUE(workoutId, logDate)
      );
    `);

    // Migration: Rename planId to workoutId in workout_logs table
    try {
      const tableInfo = await db.getAllAsync("PRAGMA table_info(workout_logs)");
      const hasOldColumn = tableInfo.some(col => col.name === 'planId');
      const hasNewColumn = tableInfo.some(col => col.name === 'workoutId');

      if (hasOldColumn && !hasNewColumn) {
        await db.execAsync(`
          BEGIN TRANSACTION;

          CREATE TABLE workout_logs_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workoutId INTEGER NOT NULL,
            logDate TEXT NOT NULL,
            status TEXT DEFAULT 'in_progress',
            totalDurationSeconds INTEGER DEFAULT 0,
            startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completedAt TIMESTAMP,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE,
            UNIQUE(workoutId, logDate)
          );

          INSERT INTO workout_logs_new (id, workoutId, logDate, status, totalDurationSeconds, startedAt, completedAt, createdAt)
          SELECT id, planId, logDate, status, totalDurationSeconds, startedAt, completedAt, createdAt FROM workout_logs;

          DROP TABLE workout_logs;

          ALTER TABLE workout_logs_new RENAME TO workout_logs;

          COMMIT;
        `);
        console.log('Migration completed: Renamed planId to workoutId in workout_logs table');
      }
    } catch (error) {
      console.error('Migration error for workout_logs table:', error);
    }

    // Create set_logs table for tracking individual set data
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS set_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workoutLogId INTEGER NOT NULL,
        exerciseId INTEGER NOT NULL,
        setNumber INTEGER NOT NULL,
        repsCompleted INTEGER,
        weightUsed REAL,
        rpe INTEGER,
        durationSeconds INTEGER DEFAULT 0,
        restTimeUsedSeconds INTEGER DEFAULT 0,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workoutLogId) REFERENCES workout_logs(id) ON DELETE CASCADE,
        FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE
      );
    `);

    // Create goal_preferences table for meal stats visibility settings
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goal_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        statName TEXT UNIQUE NOT NULL,
        isEnabled INTEGER DEFAULT 1,
        displayOrder INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default goal preferences if they don't exist
    const existingPrefs = await db.getAllAsync('SELECT * FROM goal_preferences');
    const allDefaultPrefs = [
      // Meal Stats
      { statName: 'calorieTarget', isEnabled: 1, displayOrder: 0 },
      { statName: 'proteinIntake', isEnabled: 1, displayOrder: 1 },
      { statName: 'carbsIntake', isEnabled: 0, displayOrder: 2 },
      { statName: 'fatsIntake', isEnabled: 0, displayOrder: 3 },
      { statName: 'mealPrepTips', isEnabled: 1, displayOrder: 4 },
      // Workout Stats
      { statName: 'workoutTarget', isEnabled: 1, displayOrder: 5 },
      { statName: 'exercisesCompleted', isEnabled: 1, displayOrder: 6 },
      { statName: 'consistency', isEnabled: 1, displayOrder: 7 },
      { statName: 'strengthStats', isEnabled: 1, displayOrder: 8 },
      { statName: 'volumeStats', isEnabled: 1, displayOrder: 9 },
      { statName: 'restTimeStats', isEnabled: 0, displayOrder: 10 },
      { statName: 'recoveryStats', isEnabled: 0, displayOrder: 11 },
    ];

    if (existingPrefs.length === 0) {
      // First time setup - insert all default preferences
      for (const pref of allDefaultPrefs) {
        await db.runAsync(
          'INSERT INTO goal_preferences (statName, isEnabled, displayOrder) VALUES (?, ?, ?)',
          [pref.statName, pref.isEnabled, pref.displayOrder]
        );
      }
    } else {
      // Migration: Insert any missing preferences that don't exist yet
      const existingStatNames = existingPrefs.map(p => p.statName);
      for (const pref of allDefaultPrefs) {
        if (!existingStatNames.includes(pref.statName)) {
          try {
            await db.runAsync(
              'INSERT INTO goal_preferences (statName, isEnabled, displayOrder) VALUES (?, ?, ?)',
              [pref.statName, pref.isEnabled, pref.displayOrder]
            );
          } catch (error) {
            // Stat already exists or insert failed, continue
          }
        }
      }
    }

    // Create user_settings table for general preferences
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        settingKey TEXT UNIQUE NOT NULL,
        settingValue TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default user settings if they don't exist
    const defaultSettings = [
      { key: 'streakTrackingMetric', value: 'calories' },
      { key: 'stepGoal', value: '10000' },
    ];

    for (const setting of defaultSettings) {
      const existingSettings = await db.getAllAsync('SELECT * FROM user_settings WHERE settingKey = ?', [setting.key]);
      if (existingSettings.length === 0) {
        await db.runAsync(
          'INSERT INTO user_settings (settingKey, settingValue) VALUES (?, ?)',
          [setting.key, setting.value]
        );
      }
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Add a new workout plan
 */
export const addWorkout = async (name, description = '') => {
  try {
    await db.runAsync(
      'INSERT INTO workouts (name, description) VALUES (?, ?)',
      [name, description]
    );

    // Fetch the last inserted workout to get its ID
    const lastWorkout = await db.getFirstAsync(
      'SELECT id FROM workouts ORDER BY id DESC LIMIT 1'
    );

    return lastWorkout?.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all workouts
 */
export const getAllWorkouts = async () => {
  try {
    const result = await db.getAllAsync('SELECT * FROM workouts ORDER BY createdAt DESC');
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get a single workout by ID
 */
export const getWorkoutById = async (workoutId) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM workouts WHERE id = ?',
      [workoutId]
    );
    return result;
  } catch (error) {
    return null;
  }
};

/**
 * Update a workout
 */
export const updateWorkout = async (workoutId, name, description) => {
  try {
    await db.runAsync(
      'UPDATE workouts SET name = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, workoutId]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a workout
 */
export const deleteWorkout = async (workoutId) => {
  try {
    await db.runAsync('DELETE FROM workouts WHERE id = ?', [workoutId]);
  } catch (error) {
    throw error;
  }
};

/**
 * Add an exercise to a workout
 * @param {number} workoutId - Workout ID
 * @param {string} name - Exercise name
 * @param {number} sets - Number of sets
 * @param {number} reps - Reps per set
 * @param {number} weight - Weight used (default 0)
 * @param {number} restTime - Rest time in seconds (default 0)
 * @param {string} notes - Exercise notes (default '')
 * @param {string|Array} targetBodyParts - Target body parts as JSON string or array (default '')
 */
export const addExercise = async (workoutId, name, sets, reps, weight = 0, restTime = 0, notes = '', targetBodyParts = '') => {
  try {
    // Convert array to JSON string if needed
    const bodyPartsStr = Array.isArray(targetBodyParts) ? JSON.stringify(targetBodyParts) : (targetBodyParts || '');

    await db.runAsync(
      'INSERT INTO exercises (workoutId, name, sets, reps, weight, restTime, notes, targetBodyParts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [workoutId, name, sets, reps, weight, restTime, notes, bodyPartsStr]
    );

    // Fetch the last inserted exercise to get its ID
    const lastExercise = await db.getFirstAsync(
      'SELECT id FROM exercises ORDER BY id DESC LIMIT 1'
    );

    return lastExercise?.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all exercises for a workout
 */
export const getExercisesByWorkoutId = async (workoutId) => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM exercises WHERE workoutId = ? ORDER BY createdAt ASC',
      [workoutId]
    );
    // Parse targetBodyParts JSON for each exercise
    return (result || []).map(exercise => ({
      ...exercise,
      targetBodyParts: exercise.targetBodyParts ? JSON.parse(exercise.targetBodyParts) : []
    }));
  } catch (error) {
    return [];
  }
};

/**
 * Get all distinct target body parts for a workout
 * Returns an array of unique body part names targeted by all exercises in the workout
 */
export const getWorkoutTargetBodyParts = async (workoutId) => {
  try {
    const result = await db.getAllAsync(
      'SELECT targetBodyParts FROM exercises WHERE workoutId = ? AND targetBodyParts IS NOT NULL AND targetBodyParts != ""',
      [workoutId]
    );

    const bodyPartsSet = new Set();

    result?.forEach(row => {
      try {
        if (row.targetBodyParts) {
          const parts = JSON.parse(row.targetBodyParts);
          if (Array.isArray(parts)) {
            parts.forEach(part => bodyPartsSet.add(part));
          }
        }
      } catch (parseError) {
        // Skip rows that can't be parsed
      }
    });

    return Array.from(bodyPartsSet);
  } catch (error) {
    console.error('Error getting workout target body parts:', error);
    return [];
  }
};

/**
 * Get count of exercises for a workout
 */
export const getExerciseCount = async (workoutId) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM exercises WHERE workoutId = ?',
      [workoutId]
    );
    return result?.count || 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Update an exercise
 * @param {number} exerciseId - Exercise ID
 * @param {string} name - Exercise name
 * @param {number} sets - Number of sets
 * @param {number} reps - Reps per set
 * @param {number} weight - Weight used (default 0)
 * @param {number} restTime - Rest time in seconds (default 0)
 * @param {string} notes - Exercise notes (default '')
 * @param {string|Array} targetBodyParts - Target body parts as JSON string or array (default '')
 */
export const updateExercise = async (exerciseId, name, sets, reps, weight = 0, restTime = 0, notes = '', targetBodyParts = '') => {
  try {
    // Convert array to JSON string if needed
    const bodyPartsStr = Array.isArray(targetBodyParts) ? JSON.stringify(targetBodyParts) : (targetBodyParts || '');

    await db.runAsync(
      'UPDATE exercises SET name = ?, sets = ?, reps = ?, weight = ?, restTime = ?, notes = ?, targetBodyParts = ? WHERE id = ?',
      [name, sets, reps, weight, restTime, notes, bodyPartsStr, exerciseId]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Delete an exercise
 */
export const deleteExercise = async (exerciseId) => {
  try {
    await db.runAsync('DELETE FROM exercises WHERE id = ?', [exerciseId]);
  } catch (error) {
    throw error;
  }
};

/**
 * Seed initial dummy data
 */
export const seedDummyData = async () => {
  try {
    // Check if data already exists
    const existingWorkouts = await getAllWorkouts();
    if (existingWorkouts.length > 0) {
      // Seed macro goals with today's date (will apply to today and all future dates)
      const today = new Date().toISOString().split('T')[0];
      const existingMacros = await db.getFirstAsync('SELECT * FROM macro_goals WHERE goalDate = ?', [today]);
      if (!existingMacros) {
        await setMacroGoals(today, 2500, 120, 300, 80);
      }

      // Check if default meals already exist
      const existingMeals = await getAllMeals();
      const hasDefaultMeals = existingMeals.length > 0;

      // Only seed meals if they don't exist
      if (!hasDefaultMeals) {
        // Add default meals for each food type
        // ============================================================================
        // VEGETARIAN MEALS
        // ============================================================================
        await addMeal('Spinach Salad', 'Vegetables', 150, 8, 12, 6, 'veg', 200);
        await addMeal('Paneer Curry', 'Indian', 320, 22, 15, 18, 'veg', 250);
        await addMeal('Vegetable Biryani', 'Indian', 280, 12, 45, 8, 'veg', 300);
        await addMeal('Dal Makhani', 'Indian', 250, 16, 28, 10, 'veg', 280);
        await addMeal('Broccoli Pasta', 'Italian', 380, 14, 55, 12, 'veg', 320);

        // ============================================================================
        // NON-VEGETARIAN MEALS
        // ============================================================================
        await addMeal('Grilled Chicken Breast', 'Protein', 320, 42, 0, 16, 'non-veg', 200);
        await addMeal('Butter Chicken', 'Indian', 420, 28, 18, 24, 'non-veg', 300);
        await addMeal('Fish Curry', 'Indian', 380, 35, 12, 20, 'non-veg', 280);
        await addMeal('Tandoori Chicken', 'Indian', 350, 45, 8, 15, 'non-veg', 250);
        await addMeal('Mutton Biryani', 'Indian', 450, 32, 48, 18, 'non-veg', 350);

        // ============================================================================
        // EGG MEALS
        // ============================================================================
        await addMeal('Scrambled Eggs', 'Breakfast', 180, 14, 2, 14, 'egg', 100);
        await addMeal('Omelet with Vegetables', 'Breakfast', 220, 16, 8, 16, 'egg', 150);
        await addMeal('Boiled Eggs', 'Protein', 160, 13, 1, 12, 'egg', 100);
        await addMeal('Egg Fried Rice', 'Asian', 340, 12, 48, 12, 'egg', 300);
        await addMeal('Masala Eggs', 'Indian', 260, 18, 12, 16, 'egg', 180);

        // ============================================================================
        // VEGAN MEALS
        // ============================================================================
        await addMeal('Chickpea Salad', 'Vegan', 240, 12, 32, 6, 'vegan', 250);
        await addMeal('Tofu Stir Fry', 'Asian', 280, 18, 22, 14, 'vegan', 280);
        await addMeal('Lentil Soup', 'Vegan', 180, 14, 26, 2, 'vegan', 300);
        await addMeal('Quinoa Buddha Bowl', 'Vegan', 320, 12, 48, 8, 'vegan', 320);
        await addMeal('Vegetable Stew', 'Vegan', 160, 8, 28, 2, 'vegan', 350);
      }

      // Always reseed weight data with dummy data
      await db.runAsync('DELETE FROM weight_tracking');

      // Seed dummy weight data for the last 2 months
      const todayDate = new Date();
      const weightDataPoints = [
        { daysAgo: 60, weight: 82.0 },
        { daysAgo: 58, weight: 81.8 },
        { daysAgo: 56, weight: 81.6 },
        { daysAgo: 54, weight: 81.4 },
        { daysAgo: 52, weight: 81.2 },
        { daysAgo: 50, weight: 81.0 },
        { daysAgo: 48, weight: 80.7 },
        { daysAgo: 46, weight: 80.5 },
        { daysAgo: 44, weight: 80.2 },
        { daysAgo: 42, weight: 80.0 },
        { daysAgo: 40, weight: 79.7 },
        { daysAgo: 38, weight: 79.5 },
        { daysAgo: 36, weight: 79.2 },
        { daysAgo: 34, weight: 79.0 },
        { daysAgo: 32, weight: 78.7 },
        { daysAgo: 30, weight: 78.5 },
        { daysAgo: 28, weight: 78.2 },
        { daysAgo: 26, weight: 78.0 },
        { daysAgo: 24, weight: 77.7 },
        { daysAgo: 22, weight: 77.5 },
        { daysAgo: 20, weight: 77.2 },
        { daysAgo: 18, weight: 77.0 },
        { daysAgo: 16, weight: 76.7 },
        { daysAgo: 14, weight: 76.5 },
        { daysAgo: 12, weight: 76.2 },
        { daysAgo: 10, weight: 76.0 },
        { daysAgo: 8, weight: 75.7 },
        { daysAgo: 6, weight: 75.5 },
        { daysAgo: 4, weight: 75.2 },
        { daysAgo: 2, weight: 75.0 },
        { daysAgo: 0, weight: 76.2 },
      ];
      const targetWeightValue = 75;
      for (let i = 0; i < weightDataPoints.length; i++) {
        const dataPoint = weightDataPoints[i];
        const entryDate = new Date(todayDate.getTime() - dataPoint.daysAgo * 24 * 60 * 60 * 1000);
        const dateStr = entryDate.toISOString().split('T')[0];
        await addWeightEntry(dateStr, dataPoint.weight, targetWeightValue);
      }
      return;
    }

    // Seed default macro goals with today's date (will apply to today and all future dates)
    const today = new Date().toISOString().split('T')[0];
    await setMacroGoals(today, 2500, 120, 300, 80);

    // Add dummy workouts and wait for each to complete
    const plan1Id = await addWorkout('Chest Day', 'Focus on chest and triceps');

    const plan2Id = await addWorkout('Leg Day', 'Focus on quads, hamstrings, and glutes');

    const plan3Id = await addWorkout('Back & Biceps', 'Focus on back and biceps');

    // Add exercises for Chest Day
    await addExercise(plan1Id, 'Bench Press', 4, 8, 185, 60, 'Explosive', ['Chest', 'Triceps']);
    await addExercise(plan1Id, 'Incline Dumbbell Press', 3, 10, 60, 0, '', ['Chest', 'Shoulders']);
    await addExercise(plan1Id, 'Tricep Dips', 3, 12, 0, 0, 'Bodyweight', ['Triceps', 'Chest']);
    await addExercise(plan1Id, 'Chest Fly', 3, 12, 50, 0, '', ['Chest']);

    // Add exercises for Leg Day
    await addExercise(plan2Id, 'Squats', 4, 6, 225, 90, 'Heavy', ['Quadriceps', 'Hamstrings', 'Glutes']);
    await addExercise(plan2Id, 'Leg Press', 3, 10, 450, 60, '', ['Quadriceps', 'Glutes']);
    await addExercise(plan2Id, 'Leg Curl', 3, 12, 150, 0, '', ['Hamstrings']);
    await addExercise(plan2Id, 'Leg Extension', 3, 12, 160, 0, '', ['Quadriceps']);
    await addExercise(plan2Id, 'Calf Raises', 3, 15, 200, 0, '', ['Calves']);

    // Add exercises for Back & Biceps
    await addExercise(plan3Id, 'Deadlift', 3, 5, 315, 180, 'Heavy', ['Back', 'Hamstrings', 'Glutes']);
    await addExercise(plan3Id, 'Barbell Row', 4, 8, 225, 90, '', ['Back', 'Biceps']);
    await addExercise(plan3Id, 'Barbell Curl', 3, 8, 85, 60, '', ['Biceps']);
    await addExercise(plan3Id, 'Lat Pulldown', 3, 12, 180, 60, '', ['Back', 'Biceps']);

    // Seed dummy weight tracking data for the last 2 months
    const todayDate = new Date();
    const twoMonthsAgo = new Date(todayDate.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Generate realistic weight data points with a gradual downward trend
    // More frequent entries to show detailed progress
    const weightDataPoints = [
      { daysAgo: 60, weight: 82.0 },
      { daysAgo: 58, weight: 81.8 },
      { daysAgo: 56, weight: 81.6 },
      { daysAgo: 54, weight: 81.4 },
      { daysAgo: 52, weight: 81.2 },
      { daysAgo: 50, weight: 81.0 },
      { daysAgo: 48, weight: 80.7 },
      { daysAgo: 46, weight: 80.5 },
      { daysAgo: 44, weight: 80.2 },
      { daysAgo: 42, weight: 80.0 },
      { daysAgo: 40, weight: 79.7 },
      { daysAgo: 38, weight: 79.5 },
      { daysAgo: 36, weight: 79.2 },
      { daysAgo: 34, weight: 79.0 },
      { daysAgo: 32, weight: 78.7 },
      { daysAgo: 30, weight: 78.5 },
      { daysAgo: 28, weight: 78.2 },
      { daysAgo: 26, weight: 78.0 },
      { daysAgo: 24, weight: 77.7 },
      { daysAgo: 22, weight: 77.5 },
      { daysAgo: 20, weight: 77.2 },
      { daysAgo: 18, weight: 77.0 },
      { daysAgo: 16, weight: 76.7 },
      { daysAgo: 14, weight: 76.5 },
      { daysAgo: 12, weight: 76.2 },
      { daysAgo: 10, weight: 76.0 },
      { daysAgo: 8, weight: 75.7 },
      { daysAgo: 6, weight: 75.5 },
      { daysAgo: 4, weight: 75.2 },
      { daysAgo: 2, weight: 75.0 },
      { daysAgo: 0, weight: 76.2 },
    ];

    const targetWeightValue = 75;

    // Add all weight data points
    for (const dataPoint of weightDataPoints) {
      const entryDate = new Date(todayDate.getTime() - dataPoint.daysAgo * 24 * 60 * 60 * 1000);
      const dateStr = entryDate.toISOString().split('T')[0];
      await addWeightEntry(dateStr, dataPoint.weight, targetWeightValue);
    }

    // Add default meals for each food type
    // ============================================================================
    // VEGETARIAN MEALS
    // ============================================================================
    await addMeal('Spinach Salad', 'Vegetables', 150, 8, 12, 6, 'veg', 200);
    await addMeal('Paneer Curry', 'Indian', 320, 22, 15, 18, 'veg', 250);
    await addMeal('Vegetable Biryani', 'Indian', 280, 12, 45, 8, 'veg', 300);
    await addMeal('Dal Makhani', 'Indian', 250, 16, 28, 10, 'veg', 280);
    await addMeal('Broccoli Pasta', 'Italian', 380, 14, 55, 12, 'veg', 320);

    // ============================================================================
    // NON-VEGETARIAN MEALS
    // ============================================================================
    await addMeal('Grilled Chicken Breast', 'Protein', 320, 42, 0, 16, 'non-veg', 200);
    await addMeal('Butter Chicken', 'Indian', 420, 28, 18, 24, 'non-veg', 300);
    await addMeal('Fish Curry', 'Indian', 380, 35, 12, 20, 'non-veg', 280);
    await addMeal('Tandoori Chicken', 'Indian', 350, 45, 8, 15, 'non-veg', 250);
    await addMeal('Mutton Biryani', 'Indian', 450, 32, 48, 18, 'non-veg', 350);

    // ============================================================================
    // EGG MEALS
    // ============================================================================
    await addMeal('Scrambled Eggs', 'Breakfast', 180, 14, 2, 14, 'egg', 100);
    await addMeal('Omelet with Vegetables', 'Breakfast', 220, 16, 8, 16, 'egg', 150);
    await addMeal('Boiled Eggs', 'Protein', 160, 13, 1, 12, 'egg', 100);
    await addMeal('Egg Fried Rice', 'Asian', 340, 12, 48, 12, 'egg', 300);
    await addMeal('Masala Eggs', 'Indian', 260, 18, 12, 16, 'egg', 180);

    // ============================================================================
    // VEGAN MEALS
    // ============================================================================
    await addMeal('Chickpea Salad', 'Vegan', 240, 12, 32, 6, 'vegan', 250);
    await addMeal('Tofu Stir Fry', 'Asian', 280, 18, 22, 14, 'vegan', 280);
    await addMeal('Lentil Soup', 'Vegan', 180, 14, 26, 2, 'vegan', 300);
    await addMeal('Quinoa Buddha Bowl', 'Vegan', 320, 12, 48, 8, 'vegan', 320);
    await addMeal('Vegetable Stew', 'Vegan', 160, 8, 28, 2, 'vegan', 350);

  } catch (error) {
    throw error;
  }
};

/**
 * Add a new meal template
 * @param {string} name - Meal name
 * @param {string} category - Meal category
 * @param {number} calories - Caloric content
 * @param {number} protein - Protein in grams
 * @param {number} carbs - Carbohydrates in grams
 * @param {number} fats - Fats in grams
 * @param {string} mealType - Type: 'veg' | 'non-veg' | 'egg' | 'vegan' (default: 'veg')
 * @param {number} weight - Weight in grams (default: 0)
 * @param {boolean} isFavorite - Is this a favorite meal (default: false)
 */
export const addMeal = async (name, category, calories = 0, protein = 0, carbs = 0, fats = 0, mealType = 'veg', weight = 0, isFavorite = false) => {
  try {
    await db.runAsync(
      'INSERT INTO meals (name, category, calories, protein, carbs, fats, mealType, weight, isFavorite) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, calories, protein, carbs, fats, mealType, weight, isFavorite ? 1 : 0]
    );

    const lastMeal = await db.getFirstAsync(
      'SELECT id FROM meals ORDER BY id DESC LIMIT 1'
    );

    return lastMeal?.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all meals (templates)
 */
export const getAllMeals = async () => {
  try {
    const result = await db.getAllAsync('SELECT * FROM meals ORDER BY category ASC, name ASC');
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get meals by category
 */
export const getMealsByCategory = async (category) => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM meals WHERE category = ? ORDER BY name ASC',
      [category]
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Search meals by name
 */
export const searchMeals = async (searchText) => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM meals WHERE name LIKE ? ORDER BY category ASC, name ASC',
      [`%${searchText}%`]
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Delete a meal
 */
export const deleteMeal = async (mealId) => {
  try {
    await db.runAsync('DELETE FROM meals WHERE id = ?', [mealId]);
  } catch (error) {
    throw error;
  }
};

/**
 * Log a meal for a specific date
 * @param {number} mealId - ID of the meal
 * @param {string} mealDate - Date of the meal (YYYY-MM-DD)
 * @param {number} calories - Total calories
 * @param {number} protein - Total protein
 * @param {number} carbs - Total carbs
 * @param {number} fats - Total fats
 * @param {string} mealType - Type of meal (Breakfast, Lunch, Snacks, Dinner) - defaults to 'Breakfast'
 */
export const logMeal = async (mealId, mealDate, calories, protein, carbs, fats, mealType = 'Breakfast') => {
  try {
    await db.runAsync(
      'INSERT INTO meal_logs (mealId, mealDate, calories, protein, carbs, fats, mealType) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [mealId, mealDate, calories, protein, carbs, fats, mealType]
    );

    const lastLog = await db.getFirstAsync(
      'SELECT id FROM meal_logs ORDER BY id DESC LIMIT 1'
    );

    return lastLog?.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all meal logs for a specific date
 */
export const getMealLogsForDate = async (mealDate) => {
  try {
    const result = await db.getAllAsync(
      `SELECT
        ml.id,
        ml.mealId,
        ml.mealDate,
        ml.calories,
        ml.protein,
        ml.carbs,
        ml.fats,
        ml.createdAt,
        ml.mealType,
        m.name,
        m.mealType as foodType,
        m.isFavorite
      FROM meal_logs ml
      LEFT JOIN meals m ON ml.mealId = m.id
      WHERE ml.mealDate = ?
      ORDER BY ml.createdAt DESC`,
      [mealDate]
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get daily totals for a specific date
 */
export const getDailyTotals = async (mealDate) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT SUM(calories) as totalCalories, SUM(protein) as totalProtein, SUM(carbs) as totalCarbs, SUM(fats) as totalFats FROM meal_logs WHERE mealDate = ?',
      [mealDate]
    );
    return {
      totalCalories: result?.totalCalories || 0,
      totalProtein: result?.totalProtein || 0,
      totalCarbs: result?.totalCarbs || 0,
      totalFats: result?.totalFats || 0,
    };
  } catch (error) {
    return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 };
  }
};

/**
 * Update a meal log
 * @param {number} mealLogId - ID of the meal log to update
 * @param {number} calories - Total calories
 * @param {number} protein - Total protein
 * @param {number} carbs - Total carbs
 * @param {number} fats - Total fats
 * @param {string} mealType - Type of meal (Breakfast, Lunch, Snacks, Dinner) - optional
 */
export const updateMealLog = async (mealLogId, calories, protein, carbs, fats, mealType = null) => {
  try {
    if (mealType) {
      await db.runAsync(
        'UPDATE meal_logs SET calories = ?, protein = ?, carbs = ?, fats = ?, mealType = ? WHERE id = ?',
        [calories, protein, carbs, fats, mealType, mealLogId]
      );
    } else {
      await db.runAsync(
        'UPDATE meal_logs SET calories = ?, protein = ?, carbs = ?, fats = ? WHERE id = ?',
        [calories, protein, carbs, fats, mealLogId]
      );
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a meal log
 */
export const deleteMealLog = async (mealLogId) => {
  try {
    await db.runAsync('DELETE FROM meal_logs WHERE id = ?', [mealLogId]);
  } catch (error) {
    throw error;
  }
};

/**
 * Set macro goals for a date
 */
export const setMacroGoals = async (goalDate, calorieGoal, proteinGoal, carbsGoal, fatsGoal) => {
  try {
    // Delete all future macro goal entries (after goalDate)
    // This ensures the new macros apply to all future dates
    await db.runAsync(
      'DELETE FROM macro_goals WHERE goalDate > ?',
      [goalDate]
    );

    // Insert or replace the macros for the given date
    await db.runAsync(
      'INSERT OR REPLACE INTO macro_goals (goalDate, calorieGoal, proteinGoal, carbsGoal, fatsGoal) VALUES (?, ?, ?, ?, ?)',
      [goalDate, calorieGoal, proteinGoal, carbsGoal, fatsGoal]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get macro goals for a date
 * Retrieves the most recent macro goals saved on or before the given date
 * This means macros apply to the date they're saved and all future dates
 */
export const getMacroGoals = async (goalDate) => {
  try {
    // Get the most recent macro goals saved on or before goalDate
    // This way, if you save on 2025-10-23, those macros apply to 2025-10-23 and beyond
    // Exclude invalid dates like "0000-01-01"
    let result = await db.getFirstAsync(
      'SELECT * FROM macro_goals WHERE goalDate <= ? AND goalDate != "0000-01-01" ORDER BY goalDate DESC LIMIT 1',
      [goalDate]
    );

    // Return the result or hardcoded defaults as fallback
    if (result) {
      return result;
    }

    return {
      calorieGoal: 2500,
      proteinGoal: 120,
      carbsGoal: 300,
      fatsGoal: 80,
    };
  } catch (error) {
    // Return default goals on error
    return {
      calorieGoal: 2500,
      proteinGoal: 120,
      carbsGoal: 300,
      fatsGoal: 80,
    };
  }
};

/**
 * DEBUG: Get all macro goals from database
 */
export const debugGetAllMacroGoals = async () => {
  try {
    const allGoals = await db.getAllAsync('SELECT * FROM macro_goals ORDER BY goalDate DESC');
    return allGoals;
  } catch (error) {
    return [];
  }
};

/**
 * DEBUG: Clear all macro goals from database (for testing)
 */
export const debugClearAllMacroGoals = async () => {
  try {
    await db.runAsync('DELETE FROM macro_goals');
  } catch (error) {
  }
};

// ============================================================================
// WEIGHT TRACKING FUNCTIONS
// ============================================================================

/**
 * Add or update a weight entry for a specific date
 */
export const addWeightEntry = async (weightDate, currentWeight, targetWeight) => {
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO weight_tracking (weightDate, currentWeight, targetWeight) VALUES (?, ?, ?)',
      [weightDate, currentWeight, targetWeight]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get weight entries within a date range
 */
export const getWeightEntries = async (startDate, endDate) => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM weight_tracking WHERE weightDate BETWEEN ? AND ? ORDER BY weightDate ASC',
      [startDate, endDate]
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get all weight entries (for debugging)
 */
export const getAllWeightEntries = async () => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM weight_tracking ORDER BY weightDate DESC'
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get the latest weight entry
 */
export const getLatestWeightEntry = async () => {
  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM weight_tracking ORDER BY weightDate DESC LIMIT 1'
    );
    return result || null;
  } catch (error) {
    return null;
  }
};

/**
 * Get weight entry for a specific date
 */
export const getWeightEntryForDate = async (weightDate) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM weight_tracking WHERE weightDate = ?',
      [weightDate]
    );
    return result || null;
  } catch (error) {
    return null;
  }
};

/**
 * Delete a weight entry
 */
export const deleteWeightEntry = async (weightDate) => {
  try {
    await db.runAsync(
      'DELETE FROM weight_tracking WHERE weightDate = ?',
      [weightDate]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Update a meal template
 * @param {number} mealId - Meal ID to update
 * @param {string} name - Meal name
 * @param {string} category - Meal category
 * @param {number} calories - Caloric content
 * @param {number} protein - Protein in grams
 * @param {number} carbs - Carbohydrates in grams
 * @param {number} fats - Fats in grams
 * @param {string} mealType - Type: 'veg' | 'non-veg' | 'egg' | 'vegan'
 * @param {number} weight - Weight in grams
 * @param {boolean} isFavorite - Is this a favorite meal
 */
export const updateMeal = async (mealId, name, category, calories = 0, protein = 0, carbs = 0, fats = 0, mealType = 'veg', weight = 0, isFavorite = false) => {
  try {
    await db.runAsync(
      'UPDATE meals SET name = ?, category = ?, calories = ?, protein = ?, carbs = ?, fats = ?, mealType = ?, weight = ?, isFavorite = ? WHERE id = ?',
      [name, category, calories, protein, carbs, fats, mealType, weight, isFavorite ? 1 : 0, mealId]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Toggle favorite status of a meal
 * @param {number} mealId - Meal ID
 * @param {boolean} isFavorite - Favorite status
 */
export const toggleMealFavorite = async (mealId, isFavorite) => {
  try {
    await db.runAsync(
      'UPDATE meals SET isFavorite = ? WHERE id = ?',
      [isFavorite ? 1 : 0, mealId]
    );
  } catch (error) {
    throw error;
  }
};

// ============================================================================
// PLAN SCHEDULING FUNCTIONS
// ============================================================================

/**
 * Assign a plan to specific days of the week
 * daysOfWeek: array of numbers (0-6, where 0 = Sunday, 6 = Saturday)
 */
export const assignWorkoutToDays = async (workoutId, daysOfWeek) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayDayOfWeek = new Date().getDay();

    // Get the old assignments to check what's being removed
    const oldAssignments = await db.getAllAsync(
      'SELECT dayOfWeek FROM workout_schedule WHERE workoutId = ?',
      [workoutId]
    );
    const oldDays = oldAssignments ? oldAssignments.map(r => r.dayOfWeek) : [];

    // Check if today's day is being removed from assignments
    const isTodayBeingRemoved = oldDays.includes(todayDayOfWeek) && !daysOfWeek.includes(todayDayOfWeek);

    // Delete existing assignments for this workout
    await db.runAsync('DELETE FROM workout_schedule WHERE workoutId = ?', [workoutId]);

    // If today is being removed from the schedule, clean up any in-progress logs for today
    if (isTodayBeingRemoved) {
      await db.runAsync(
        'DELETE FROM workout_logs WHERE workoutId = ? AND logDate = ?',
        [workoutId, today]
      );
    }

    // Add new assignments
    for (const day of daysOfWeek) {
      await db.runAsync(
        'INSERT INTO workout_schedule (workoutId, dayOfWeek) VALUES (?, ?)',
        [workoutId, day]
      );
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Get scheduled days for a workout
 */
export const getScheduledDaysForWorkout = async (workoutId) => {
  try {
    const result = await db.getAllAsync(
      'SELECT dayOfWeek FROM workout_schedule WHERE workoutId = ? ORDER BY dayOfWeek',
      [workoutId]
    );
    return result ? result.map(r => r.dayOfWeek) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Get all workouts scheduled for a specific day of week
 */
export const getWorkoutsForDay = async (dayOfWeek) => {
  try {
    const result = await db.getAllAsync(
      `SELECT w.* FROM workouts w
       INNER JOIN workout_schedule ws ON w.id = ws.workoutId
       WHERE ws.dayOfWeek = ?
       ORDER BY w.name`,
      [dayOfWeek]
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * DEBUG: Get all scheduled workouts with their assigned days
 */
export const debugGetAllScheduledWorkouts = async () => {
  try {
    const result = await db.getAllAsync(`
      SELECT
        w.id,
        w.name,
        w.description,
        GROUP_CONCAT(ws.dayOfWeek, ',') as assignedDays
      FROM workouts w
      LEFT JOIN workout_schedule ws ON w.id = ws.workoutId
      GROUP BY w.id
      ORDER BY w.name
    `);
    return result || [];
  } catch (error) {
    console.error('debugGetAllScheduledWorkouts error:', error);
    return [];
  }
};

/**
 * DEBUG: Get today's scheduled workouts with full details
 */
export const debugGetTodayScheduledWorkouts = async () => {
  try {
    const todayDayOfWeek = new Date().getDay();
    const result = await db.getAllAsync(`
      SELECT
        w.id,
        w.name,
        w.description,
        (SELECT COUNT(*) FROM exercises WHERE workoutId = w.id) as exerciseCount
      FROM workouts w
      INNER JOIN workout_schedule ws ON w.id = ws.workoutId
      WHERE ws.dayOfWeek = ?
      ORDER BY w.name
    `, [todayDayOfWeek]);
    return result || [];
  } catch (error) {
    console.error('debugGetTodayScheduledWorkouts error:', error);
    return [];
  }
};

/**
 * DEBUG: Get all exercises for a specific workout
 */
export const debugGetExercisesForWorkout = async (workoutId) => {
  try {
    console.log('DEBUG: Querying exercises for workoutId:', workoutId);
    const result = await db.getAllAsync(`
      SELECT * FROM exercises WHERE workoutId = ?
    `, [workoutId]);
    console.log('DEBUG: Found exercises:', result);
    return result || [];
  } catch (error) {
    console.error('DEBUG: Error querying exercises:', error);
    return [];
  }
};

/**
 * Remove workout assignment from specific days
 */
export const removeWorkoutFromDays = async (workoutId, daysOfWeek) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayDayOfWeek = new Date().getDay();

    for (const day of daysOfWeek) {
      // Delete from workout_schedule
      await db.runAsync(
        'DELETE FROM workout_schedule WHERE workoutId = ? AND dayOfWeek = ?',
        [workoutId, day]
      );

      // If removing a day that matches today's day of week,
      // also remove any in-progress or pending workout logs for this workout today
      if (day === todayDayOfWeek) {
        await db.runAsync(
          'DELETE FROM workout_logs WHERE workoutId = ? AND logDate = ?',
          [workoutId, today]
        );
      }
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Mark workout as completed for a date
 */
export const markWorkoutCompleted = async (workoutId, executionDate) => {
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO workout_execution (workoutId, executionDate, status, completedAt)
       VALUES (?, ?, ?, ?)`,
      [workoutId, executionDate, 'completed', new Date().toISOString()]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get execution status for a workout on a specific date
 */
export const getWorkoutExecutionStatus = async (workoutId, executionDate) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM workout_execution WHERE workoutId = ? AND executionDate = ?',
      [workoutId, executionDate]
    );
    return result;
  } catch (error) {
    return null;
  }
};

// ==================== WORKOUT EXECUTION FUNCTIONS ====================

/**
 * Start a new workout session
 */
export const startWorkoutLog = async (workoutId, logDate = new Date().toISOString().split('T')[0]) => {
  try {
    const insertResult = await db.runAsync(
      'INSERT INTO workout_logs (workoutId, logDate, status) VALUES (?, ?, ?)',
      [workoutId, logDate, 'in_progress']
    );

    const result = await db.getFirstAsync(
      'SELECT id FROM workout_logs WHERE workoutId = ? AND logDate = ? ORDER BY id DESC LIMIT 1',
      [workoutId, logDate]
    );

    if (!result || !result.id) {
      throw new Error('Failed to create workout log');
    }

    return result.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Get active workout log for a plan today
 */
export const getActiveWorkoutLog = async (workoutId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // First try to find an in_progress workout
    let result = await db.getFirstAsync(
      'SELECT * FROM workout_logs WHERE workoutId = ? AND logDate = ? AND status = ?',
      [workoutId, today, 'in_progress']
    );

    if (result) {
      return result;
    }

    // If no in_progress workout, check if ANY workout exists for today
    // This handles cases where a previous attempt failed or was completed
    result = await db.getFirstAsync(
      'SELECT * FROM workout_logs WHERE workoutId = ? AND logDate = ?',
      [workoutId, today]
    );

    if (result) {
      // If it exists but not in_progress, update it to in_progress
      if (result.status !== 'in_progress') {
        await db.runAsync(
          'UPDATE workout_logs SET status = ? WHERE id = ?',
          ['in_progress', result.id]
        );
        result.status = 'in_progress';
      }
      return result;
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if there's any active/in-progress workout for today
 * Returns the first active workout found, or null
 */
export const getTodayActiveWorkout = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await db.getFirstAsync(
      `SELECT wl.*, w.name as workoutName
       FROM workout_logs wl
       JOIN workouts w ON wl.workoutId = w.id
       WHERE wl.logDate = ? AND wl.status = ?`,
      [today, 'in_progress']
    );

    return result || null;
  } catch (error) {
    return null;
  }
};

/**
 * Get workout log for a specific workout for today (any status)
 * Used to check if workout is in progress or completed
 */
export const getTodayWorkoutLogForWorkout = async (workoutId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await db.getFirstAsync(
      `SELECT * FROM workout_logs
       WHERE workoutId = ? AND logDate = ?`,
      [workoutId, today]
    );

    return result || null;
  } catch (error) {
    return null;
  }
};

/**
 * Log a set for an exercise during workout
 */
export const logExerciseSet = async (workoutLogId, exerciseId, setNumber, repsCompleted, weightUsed, rpe = null, notes = '', durationSeconds = 0, restTimeUsedSeconds = 0) => {
  try {
    // Validate workoutLogId
    if (!workoutLogId) {
      throw new Error('workoutLogId is required and must not be null');
    }

    const insertResult = await db.runAsync(
      `INSERT INTO set_logs (workoutLogId, exerciseId, setNumber, repsCompleted, weightUsed, rpe, notes, durationSeconds, restTimeUsedSeconds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [workoutLogId, exerciseId, setNumber, repsCompleted, weightUsed, rpe, notes, durationSeconds, restTimeUsedSeconds]
    );

    const result = await db.getFirstAsync(
      'SELECT id FROM set_logs WHERE workoutLogId = ? AND exerciseId = ? AND setNumber = ? ORDER BY id DESC LIMIT 1',
      [workoutLogId, exerciseId, setNumber]
    );

    return result?.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a set log with duration and rest time
 */
export const updateSetLog = async (setLogId, durationSeconds, restTimeUsedSeconds) => {
  try {
    await db.runAsync(
      `UPDATE set_logs
       SET durationSeconds = ?, restTimeUsedSeconds = ?
       WHERE id = ?`,
      [durationSeconds, restTimeUsedSeconds, setLogId]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get all sets logged for an exercise in a workout
 */
export const getExerciseSetLogs = async (workoutLogId, exerciseId) => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM set_logs WHERE workoutLogId = ? AND exerciseId = ? ORDER BY setNumber ASC',
      [workoutLogId, exerciseId]
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get all set logs for a workout
 */
export const getWorkoutSetLogs = async (workoutLogId) => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM set_logs WHERE workoutLogId = ? ORDER BY exerciseId ASC, setNumber ASC',
      [workoutLogId]
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Complete a workout session
 */
export const completeWorkoutLog = async (workoutLogId, totalDurationSeconds) => {
  try {
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE workout_logs
       SET status = ?, totalDurationSeconds = ?, completedAt = ?
       WHERE id = ?`,
      ['completed', totalDurationSeconds, now, workoutLogId]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel a workout session
 */
export const cancelWorkoutLog = async (workoutLogId) => {
  try {
    await db.runAsync(
      'UPDATE workout_logs SET status = ? WHERE id = ?',
      ['cancelled', workoutLogId]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get complete workout summary with all exercises and sets
 */
export const getWorkoutSummary = async (workoutLogId) => {
  try {
    // Get workout info
    const workoutLog = await db.getFirstAsync(
      `SELECT wl.*, w.name as planName
       FROM workout_logs wl
       JOIN workouts w ON wl.workoutId = w.id
       WHERE wl.id = ?`,
      [workoutLogId]
    );

    if (!workoutLog) {
      return null;
    }

    // Get all sets for this workout
    const setLogs = await db.getAllAsync(
      `SELECT sl.*, e.name as exerciseName
       FROM set_logs sl
       JOIN exercises e ON sl.exerciseId = e.id
       WHERE sl.workoutLogId = ?
       ORDER BY sl.exerciseId, sl.setNumber`,
      [workoutLogId]
    );

    // Group sets by exercise
    const exerciseGroups = {};
    setLogs.forEach(set => {
      if (!exerciseGroups[set.exerciseId]) {
        exerciseGroups[set.exerciseId] = {
          id: set.exerciseId,
          name: set.exerciseName,
          sets: [],
        };
      }
      exerciseGroups[set.exerciseId].sets.push(set);
    });

    // Convert to array
    const exercises = Object.values(exerciseGroups);

    // Calculate totals
    const totalDuration = workoutLog.totalDurationSeconds || 0;
    const totalRestTime = setLogs.reduce((sum, set) => sum + (set.restTimeUsedSeconds || 0), 0);
    const totalExerciseTime = setLogs.reduce((sum, set) => sum + (set.durationSeconds || 0), 0);

    return {
      workout: workoutLog,
      exercises,
      sets: setLogs,
      stats: {
        totalDuration,
        totalRestTime,
        totalExerciseTime,
        totalSets: setLogs.length,
      },
    };
  } catch (error) {
    return null;
  }
};

/**
 * Get workout history for a plan
 */
export const getWorkoutHistory = async (workoutId, limit = 10) => {
  try {
    const result = await db.getAllAsync(
      `SELECT * FROM workout_logs
       WHERE workoutId = ? AND status = ?
       ORDER BY logDate DESC
       LIMIT ?`,
      [workoutId, 'completed', limit]
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get all goal preferences
 */
export const getGoalPreferences = async () => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM goal_preferences ORDER BY displayOrder ASC'
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Update goal preference (enable/disable a stat)
 */
export const updateGoalPreference = async (statName, isEnabled) => {
  try {
    await db.runAsync(
      'UPDATE goal_preferences SET isEnabled = ?, updatedAt = CURRENT_TIMESTAMP WHERE statName = ?',
      [isEnabled ? 1 : 0, statName]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get only enabled goal preferences
 */
export const getEnabledGoalPreferences = async () => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM goal_preferences WHERE isEnabled = 1 ORDER BY displayOrder ASC'
    );
    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get user setting by key
 */
export const getUserSetting = async (settingKey) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT settingValue FROM user_settings WHERE settingKey = ?',
      [settingKey]
    );
    return result?.settingValue || null;
  } catch (error) {
    return null;
  }
};

/**
 * Update user setting
 */
export const updateUserSetting = async (settingKey, settingValue) => {
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO user_settings (settingKey, settingValue, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [settingKey, settingValue]
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Delete workout log for a specific date
 */
export const deleteWorkoutLog = async (workoutId, logDate = new Date().toISOString().split('T')[0]) => {
  try {
    await db.runAsync(
      'DELETE FROM workout_logs WHERE workoutId = ? AND logDate = ?',
      [workoutId, logDate]
    );
  } catch (error) {
    throw error;
  }
};
