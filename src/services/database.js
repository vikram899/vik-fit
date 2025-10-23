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

    // Create plans table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS plans (
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
        planId INTEGER NOT NULL,
        name TEXT NOT NULL,
        sets INTEGER,
        reps INTEGER,
        weight REAL,
        time INTEGER,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE
      );
    `);

    // Migration: Add time column if it doesn't exist
    try {
      await db.execAsync('ALTER TABLE exercises ADD COLUMN time INTEGER DEFAULT 0;');
      console.log('✅ Added time column to exercises table');
    } catch (error) {
      // Column already exists, no need to add it
      console.log('✅ Time column already exists');
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

    // Create plan_schedule table for assigning plans to days of week
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS plan_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        planId INTEGER NOT NULL,
        dayOfWeek INTEGER NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
        UNIQUE(planId, dayOfWeek)
      );
    `);

    // Create plan_execution table for tracking plan completion
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS plan_execution (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        planId INTEGER NOT NULL,
        executionDate TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        completedAt TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
        UNIQUE(planId, executionDate)
      );
    `);

    // Create workout_logs table for tracking workout sessions
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        planId INTEGER NOT NULL,
        logDate TEXT NOT NULL,
        status TEXT DEFAULT 'in_progress',
        totalDurationSeconds INTEGER DEFAULT 0,
        startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completedAt TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
        UNIQUE(planId, logDate)
      );
    `);

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

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

/**
 * Add a new workout plan
 */
export const addPlan = async (name, description = '') => {
  try {
    await db.runAsync(
      'INSERT INTO plans (name, description) VALUES (?, ?)',
      [name, description]
    );

    // Fetch the last inserted plan to get its ID
    const lastPlan = await db.getFirstAsync(
      'SELECT id FROM plans ORDER BY id DESC LIMIT 1'
    );

    return lastPlan?.id;
  } catch (error) {
    console.error('Error adding plan:', error);
    throw error;
  }
};

/**
 * Get all workout plans
 */
export const getAllPlans = async () => {
  try {
    const result = await db.getAllAsync('SELECT * FROM plans ORDER BY createdAt DESC');
    return result || [];
  } catch (error) {
    console.error('Error getting plans:', error);
    return [];
  }
};

/**
 * Get a single plan by ID
 */
export const getPlanById = async (planId) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM plans WHERE id = ?',
      [planId]
    );
    return result;
  } catch (error) {
    console.error('Error getting plan:', error);
    return null;
  }
};

/**
 * Update a workout plan
 */
export const updatePlan = async (planId, name, description) => {
  try {
    await db.runAsync(
      'UPDATE plans SET name = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, planId]
    );
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
};

/**
 * Delete a workout plan
 */
export const deletePlan = async (planId) => {
  try {
    await db.runAsync('DELETE FROM plans WHERE id = ?', [planId]);
  } catch (error) {
    console.error('Error deleting plan:', error);
    throw error;
  }
};

/**
 * Add an exercise to a plan
 */
export const addExercise = async (planId, name, sets, reps, weight = 0, time = 0, notes = '') => {
  try {
    await db.runAsync(
      'INSERT INTO exercises (planId, name, sets, reps, weight, time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [planId, name, sets, reps, weight, time, notes]
    );

    // Fetch the last inserted exercise to get its ID
    const lastExercise = await db.getFirstAsync(
      'SELECT id FROM exercises ORDER BY id DESC LIMIT 1'
    );

    return lastExercise?.id;
  } catch (error) {
    console.error('Error adding exercise with planId', planId, ':', error);
    throw error;
  }
};

/**
 * Get all exercises for a plan
 */
export const getExercisesByPlanId = async (planId) => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM exercises WHERE planId = ? ORDER BY createdAt ASC',
      [planId]
    );
    return result || [];
  } catch (error) {
    console.error('Error getting exercises:', error);
    return [];
  }
};

/**
 * Get count of exercises for a plan
 */
export const getExerciseCount = async (planId) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM exercises WHERE planId = ?',
      [planId]
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Error getting exercise count:', error);
    return 0;
  }
};

/**
 * Update an exercise
 */
export const updateExercise = async (exerciseId, name, sets, reps, weight = 0, time = 0, notes = '') => {
  try {
    await db.runAsync(
      'UPDATE exercises SET name = ?, sets = ?, reps = ?, weight = ?, time = ?, notes = ? WHERE id = ?',
      [name, sets, reps, weight, time, notes, exerciseId]
    );
  } catch (error) {
    console.error('Error updating exercise:', error);
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
    console.error('Error deleting exercise:', error);
    throw error;
  }
};

/**
 * Seed initial dummy data
 */
export const seedDummyData = async () => {
  try {
    // Check if data already exists
    const existingPlans = await getAllPlans();
    if (existingPlans.length > 0) {
      console.log('✅ Database already has plans, skipping seed');
      // Seed macro goals with today's date (will apply to today and all future dates)
      const today = new Date().toISOString().split('T')[0];
      const existingMacros = await db.getFirstAsync('SELECT * FROM macro_goals WHERE goalDate = ?', [today]);
      if (!existingMacros) {
        console.log('Seeding default macro goals for today...');
        await setMacroGoals(today, 2500, 120, 300, 80);
        console.log('✅ Default macro goals seeded for', today);
      }
      return;
    }

    console.log('Starting to seed dummy data...');

    // Seed default macro goals with today's date (will apply to today and all future dates)
    const today = new Date().toISOString().split('T')[0];
    console.log('Seeding default macro goals for today (' + today + ')...');
    await setMacroGoals(today, 2500, 120, 300, 80);
    console.log('✅ Default macro goals seeded for', today);

    // Add dummy plans and wait for each to complete
    console.log('Adding Chest Day plan...');
    const plan1Id = await addPlan('Chest Day', 'Focus on chest and triceps');
    console.log('✓ Chest Day plan ID:', plan1Id);

    console.log('Adding Leg Day plan...');
    const plan2Id = await addPlan('Leg Day', 'Focus on quads, hamstrings, and glutes');
    console.log('✓ Leg Day plan ID:', plan2Id);

    console.log('Adding Back & Biceps plan...');
    const plan3Id = await addPlan('Back & Biceps', 'Focus on back and biceps');
    console.log('✓ Back & Biceps plan ID:', plan3Id);

    // Add exercises for Chest Day
    console.log('Adding exercises for Chest Day...');
    await addExercise(plan1Id, 'Bench Press', 4, 8, 185, 'Explosive');
    await addExercise(plan1Id, 'Incline Dumbbell Press', 3, 10, 60, '');
    await addExercise(plan1Id, 'Tricep Dips', 3, 12, 0, 'Bodyweight');
    await addExercise(plan1Id, 'Chest Fly', 3, 12, 50, '');
    console.log('✓ Chest Day exercises added');

    // Add exercises for Leg Day
    console.log('Adding exercises for Leg Day...');
    await addExercise(plan2Id, 'Squats', 4, 6, 225, 'Heavy');
    await addExercise(plan2Id, 'Leg Press', 3, 10, 450, '');
    await addExercise(plan2Id, 'Leg Curl', 3, 12, 150, '');
    await addExercise(plan2Id, 'Leg Extension', 3, 12, 160, '');
    await addExercise(plan2Id, 'Calf Raises', 3, 15, 200, '');
    console.log('✓ Leg Day exercises added');

    // Add exercises for Back & Biceps
    console.log('Adding exercises for Back & Biceps...');
    await addExercise(plan3Id, 'Deadlift', 3, 5, 315, 'Heavy');
    await addExercise(plan3Id, 'Barbell Row', 4, 8, 225, '');
    await addExercise(plan3Id, 'Barbell Curl', 3, 8, 85, '');
    await addExercise(plan3Id, 'Lat Pulldown', 3, 12, 180, '');
    console.log('✓ Back & Biceps exercises added');

    console.log('✅ Dummy data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
    throw error;
  }
};

/**
 * Add a new meal template
 */
export const addMeal = async (name, category, calories = 0, protein = 0, carbs = 0, fats = 0) => {
  try {
    await db.runAsync(
      'INSERT INTO meals (name, category, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, calories, protein, carbs, fats]
    );

    const lastMeal = await db.getFirstAsync(
      'SELECT id FROM meals ORDER BY id DESC LIMIT 1'
    );

    return lastMeal?.id;
  } catch (error) {
    console.error('Error adding meal:', error);
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
    console.error('Error getting meals:', error);
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
    console.error('Error getting meals by category:', error);
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
    console.error('Error searching meals:', error);
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
    console.error('Error deleting meal:', error);
    throw error;
  }
};

/**
 * Log a meal for a specific date
 */
export const logMeal = async (mealId, mealDate, calories, protein, carbs, fats) => {
  try {
    await db.runAsync(
      'INSERT INTO meal_logs (mealId, mealDate, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?, ?)',
      [mealId, mealDate, calories, protein, carbs, fats]
    );

    const lastLog = await db.getFirstAsync(
      'SELECT id FROM meal_logs ORDER BY id DESC LIMIT 1'
    );

    return lastLog?.id;
  } catch (error) {
    console.error('Error logging meal:', error);
    throw error;
  }
};

/**
 * Get all meal logs for a specific date
 */
export const getMealLogsForDate = async (mealDate) => {
  try {
    const result = await db.getAllAsync(
      'SELECT ml.*, m.name FROM meal_logs ml LEFT JOIN meals m ON ml.mealId = m.id WHERE ml.mealDate = ? ORDER BY ml.createdAt DESC',
      [mealDate]
    );
    return result || [];
  } catch (error) {
    console.error('Error getting meal logs:', error);
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
    console.error('Error getting daily totals:', error);
    return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 };
  }
};

/**
 * Update a meal log
 */
export const updateMealLog = async (mealLogId, calories, protein, carbs, fats) => {
  try {
    await db.runAsync(
      'UPDATE meal_logs SET calories = ?, protein = ?, carbs = ?, fats = ? WHERE id = ?',
      [calories, protein, carbs, fats, mealLogId]
    );
  } catch (error) {
    console.error('Error updating meal log:', error);
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
    console.error('Error deleting meal log:', error);
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
    console.error('Error setting macro goals:', error);
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
    let result = await db.getFirstAsync(
      'SELECT * FROM macro_goals WHERE goalDate <= ? ORDER BY goalDate DESC LIMIT 1',
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
    console.error('Error getting macro goals:', error);
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
    console.log('DEBUG: All macro goals in database:', allGoals);
    return allGoals;
  } catch (error) {
    console.error('Error getting all macro goals:', error);
    return [];
  }
};

/**
 * DEBUG: Clear all macro goals from database (for testing)
 */
export const debugClearAllMacroGoals = async () => {
  try {
    await db.runAsync('DELETE FROM macro_goals');
    console.log('DEBUG: Cleared all macro goals from database');
  } catch (error) {
    console.error('Error clearing macro goals:', error);
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
    console.log('Weight entry saved for', weightDate);
  } catch (error) {
    console.error('Error adding weight entry:', error);
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
    console.error('Error getting weight entries:', error);
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
    console.error('Error getting all weight entries:', error);
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
    console.error('Error getting latest weight entry:', error);
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
    console.error('Error getting weight entry for date:', error);
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
    console.error('Error deleting weight entry:', error);
    throw error;
  }
};

/**
 * Update a meal template
 */
export const updateMeal = async (mealId, name, category, calories = 0, protein = 0, carbs = 0, fats = 0) => {
  try {
    await db.runAsync(
      'UPDATE meals SET name = ?, category = ?, calories = ?, protein = ?, carbs = ?, fats = ? WHERE id = ?',
      [name, category, calories, protein, carbs, fats, mealId]
    );
  } catch (error) {
    console.error('Error updating meal:', error);
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
export const assignPlanToDays = async (planId, daysOfWeek) => {
  try {
    // Delete existing assignments for this plan
    await db.runAsync('DELETE FROM plan_schedule WHERE planId = ?', [planId]);

    // Add new assignments
    for (const day of daysOfWeek) {
      await db.runAsync(
        'INSERT INTO plan_schedule (planId, dayOfWeek) VALUES (?, ?)',
        [planId, day]
      );
    }
  } catch (error) {
    console.error('Error assigning plan to days:', error);
    throw error;
  }
};

/**
 * Get scheduled days for a plan
 */
export const getScheduledDaysForPlan = async (planId) => {
  try {
    const result = await db.getAllAsync(
      'SELECT dayOfWeek FROM plan_schedule WHERE planId = ? ORDER BY dayOfWeek',
      [planId]
    );
    return result ? result.map(r => r.dayOfWeek) : [];
  } catch (error) {
    console.error('Error getting scheduled days:', error);
    return [];
  }
};

/**
 * Get all plans scheduled for a specific day of week
 */
export const getPlansForDay = async (dayOfWeek) => {
  try {
    const result = await db.getAllAsync(
      `SELECT p.* FROM plans p
       INNER JOIN plan_schedule ps ON p.id = ps.planId
       WHERE ps.dayOfWeek = ?
       ORDER BY p.name`,
      [dayOfWeek]
    );
    return result || [];
  } catch (error) {
    console.error('Error getting plans for day:', error);
    return [];
  }
};

/**
 * Remove plan assignment from specific days
 */
export const removePlanFromDays = async (planId, daysOfWeek) => {
  try {
    for (const day of daysOfWeek) {
      await db.runAsync(
        'DELETE FROM plan_schedule WHERE planId = ? AND dayOfWeek = ?',
        [planId, day]
      );
    }
  } catch (error) {
    console.error('Error removing plan from days:', error);
    throw error;
  }
};

/**
 * Mark plan as completed for a date
 */
export const markPlanCompleted = async (planId, executionDate) => {
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO plan_execution (planId, executionDate, status, completedAt)
       VALUES (?, ?, ?, ?)`,
      [planId, executionDate, 'completed', new Date().toISOString()]
    );
  } catch (error) {
    console.error('Error marking plan as completed:', error);
    throw error;
  }
};

/**
 * Get execution status for a plan on a specific date
 */
export const getPlanExecutionStatus = async (planId, executionDate) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM plan_execution WHERE planId = ? AND executionDate = ?',
      [planId, executionDate]
    );
    return result;
  } catch (error) {
    console.error('Error getting execution status:', error);
    return null;
  }
};

// ==================== WORKOUT EXECUTION FUNCTIONS ====================

/**
 * Start a new workout session
 */
export const startWorkoutLog = async (planId, logDate = new Date().toISOString().split('T')[0]) => {
  try {
    const insertResult = await db.runAsync(
      'INSERT INTO workout_logs (planId, logDate, status) VALUES (?, ?, ?)',
      [planId, logDate, 'in_progress']
    );

    const result = await db.getFirstAsync(
      'SELECT id FROM workout_logs WHERE planId = ? AND logDate = ? ORDER BY id DESC LIMIT 1',
      [planId, logDate]
    );

    if (!result || !result.id) {
      throw new Error('Failed to create workout log');
    }

    return result.id;
  } catch (error) {
    console.error('Error starting workout log:', error);
    throw error;
  }
};

/**
 * Get active workout log for a plan today
 */
export const getActiveWorkoutLog = async (planId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // First try to find an in_progress workout
    let result = await db.getFirstAsync(
      'SELECT * FROM workout_logs WHERE planId = ? AND logDate = ? AND status = ?',
      [planId, today, 'in_progress']
    );

    if (result) {
      return result;
    }

    // If no in_progress workout, check if ANY workout exists for today
    // This handles cases where a previous attempt failed or was completed
    result = await db.getFirstAsync(
      'SELECT * FROM workout_logs WHERE planId = ? AND logDate = ?',
      [planId, today]
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
    console.error('Error getting active workout log:', error);
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
      `SELECT wl.*, p.name as planName
       FROM workout_logs wl
       JOIN plans p ON wl.planId = p.id
       WHERE wl.logDate = ? AND wl.status = ?`,
      [today, 'in_progress']
    );

    return result || null;
  } catch (error) {
    console.error('Error getting today active workout:', error);
    return null;
  }
};

/**
 * Get workout log for a specific plan for today (any status)
 * Used to check if workout is in progress or completed
 */
export const getTodayWorkoutLogForPlan = async (planId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await db.getFirstAsync(
      `SELECT * FROM workout_logs
       WHERE planId = ? AND logDate = ?`,
      [planId, today]
    );

    return result || null;
  } catch (error) {
    console.error('Error getting today workout log:', error);
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
    console.error('Error logging exercise set:', error);
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
    console.error('Error updating set log:', error);
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
    console.error('Error getting exercise set logs:', error);
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
    console.error('Error getting workout set logs:', error);
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
    console.error('Error completing workout log:', error);
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
    console.error('Error cancelling workout log:', error);
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
      `SELECT wl.*, p.name as planName
       FROM workout_logs wl
       JOIN plans p ON wl.planId = p.id
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
    console.error('Error getting workout summary:', error);
    return null;
  }
};

/**
 * Get workout history for a plan
 */
export const getWorkoutHistory = async (planId, limit = 10) => {
  try {
    const result = await db.getAllAsync(
      `SELECT * FROM workout_logs
       WHERE planId = ? AND status = ?
       ORDER BY logDate DESC
       LIMIT ?`,
      [planId, 'completed', limit]
    );
    return result || [];
  } catch (error) {
    console.error('Error getting workout history:', error);
    return [];
  }
};
