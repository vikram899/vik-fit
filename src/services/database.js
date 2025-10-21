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
      return;
    }

    console.log('Starting to seed dummy data...');

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
