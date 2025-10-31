/**
 * Workout Statistics and Weekly Summary Functions
 * Calculate weekly completion metrics and trends
 */

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('vikfit.db');

/**
 * Get workout completion count for a specific week
 * @param {number} planId - Workout ID
 * @param {string} startDate - Sunday of the week (YYYY-MM-DD)
 */
export const getWeeklyWorkoutCompletions = async (planId, startDate) => {
  try {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + 6); // Saturday
    const endDate = endDateObj.toISOString().split('T')[0];

    const result = await db.getFirstAsync(
      `SELECT COUNT(*) as completionCount
       FROM workout_logs
       WHERE workoutId = ? AND logDate >= ? AND logDate <= ? AND status = 'completed'`,
      [planId, startDate, endDate]
    );

    return result?.completionCount || 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Get all workouts with their completion metrics for the week
 */
export const getAllWorkoutsWithMetrics = async (startDate) => {
  try {
    const result = await db.getAllAsync(
      `SELECT
        w.id,
        w.name,
        w.description,
        COUNT(DISTINCT ws.dayOfWeek) as assignedDaysCount,
        (SELECT COUNT(*) FROM workout_logs
         WHERE workoutId = w.id
         AND logDate >= ?
         AND logDate <= ?
         AND status = 'completed') as completionCount
       FROM workouts w
       LEFT JOIN workout_schedule ws ON w.id = ws.workoutId
       GROUP BY w.id`,
      [startDate, getEndDate(startDate)]
    );

    return result || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get exercise count for a specific plan
 */
export const getPlanExerciseCount = async (planId) => {
  try {
    const result = await db.getFirstAsync(
      `SELECT COUNT(*) as exerciseCount FROM exercises WHERE workoutId = ?`,
      [planId]
    );

    return result?.exerciseCount || 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Get scheduled days for a plan
 */
export const getPlanScheduledDays = async (planId) => {
  try {
    const result = await db.getAllAsync(
      `SELECT dayOfWeek FROM workout_schedule WHERE workoutId = ? ORDER BY dayOfWeek`,
      [planId]
    );

    return result?.map(r => r.dayOfWeek) || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get Monday of the week for a given date
 */
export const getMondayOfWeek = (date) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  // If Sunday (0), go back 6 days. Otherwise, go back (dayOfWeek - 1) days
  const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const difference = dateObj.getDate() - daysBack;
  const monday = new Date(dateObj.setDate(difference));
  return monday.toISOString().split('T')[0];
};

/**
 * Get end date (Sunday) for a week
 */
const getEndDate = (startDate) => {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(startDateObj);
  endDateObj.setDate(endDateObj.getDate() + 6);
  return endDateObj.toISOString().split('T')[0];
};

/**
 * Calculate workout completion percentage for the week
 * @param {number} completionCount - Times completed this week
 * @param {number} assignedDaysCount - Days the workout is assigned
 */
export const calculateCompletionPercentage = (completionCount, assignedDaysCount) => {
  if (assignedDaysCount === 0) return 0;
  return Math.min((completionCount / assignedDaysCount) * 100, 100);
};

/**
 * Get total workouts and exercises completed for a specific week
 */
export const getWeeklyWorkoutStats = async (startDate) => {
  try {
    const endDate = getEndDate(startDate);

    const result = await db.getFirstAsync(
      `SELECT
        COUNT(DISTINCT wl.workoutId) as workoutsCompleted,
        COUNT(DISTINCT sl.exerciseId) as exercisesCompleted
       FROM workout_logs wl
       LEFT JOIN set_logs sl ON wl.id = sl.workoutLogId
       WHERE wl.logDate >= ? AND wl.logDate <= ? AND wl.status = 'completed'`,
      [startDate, endDate]
    );

    return {
      workoutsCompleted: result?.workoutsCompleted || 0,
      exercisesCompleted: result?.exercisesCompleted || 0,
    };
  } catch (error) {
    return { workoutsCompleted: 0, exercisesCompleted: 0 };
  }
};

/**
 * Get daily breakdown of completed workouts for each day of the week
 */
export const getWeeklyWorkoutBreakdown = async (startDate) => {
  try {
    const weekData = [];
    const startDateObj = new Date(startDate);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDateObj);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();

      // Get all assigned workouts for this day of the week
      const assignedWorkouts = await db.getAllAsync(
        `SELECT DISTINCT w.id, w.name
         FROM workouts w
         JOIN workout_schedule ws ON w.id = ws.workoutId
         WHERE ws.dayOfWeek = ?`,
        [dayOfWeek]
      );

      // Get all completed workouts for this day
      const completedWorkouts = await db.getAllAsync(
        `SELECT
          w.id,
          w.name,
          COUNT(DISTINCT sl.exerciseId) as exerciseCount
         FROM workout_logs wl
         JOIN workouts w ON wl.workoutId = w.id
         LEFT JOIN set_logs sl ON wl.id = sl.workoutLogId
         WHERE wl.logDate = ? AND wl.status = 'completed'
         GROUP BY w.id`,
        [dateStr]
      );

      // Calculate total exercises completed for this day
      const totalExercisesCompleted = (completedWorkouts || []).reduce((sum, w) => sum + (w.exerciseCount || 0), 0);

      weekData.push({
        date: dateStr,
        day: dayNames[i],
        dayNumber: i,
        assignedWorkouts: assignedWorkouts || [],
        totalWorkoutsAssigned: (assignedWorkouts || []).length,
        completedWorkouts: completedWorkouts || [],
        totalWorkoutsCompleted: (completedWorkouts || []).length,
        totalExercisesCompleted: totalExercisesCompleted,
      });
    }

    return weekData;
  } catch (error) {
    return [];
  }
};

/**
 * Calculate weekly workout and exercise goals based on scheduled workouts
 * Counts how many workouts are scheduled for the week and total exercises
 */
export const getWeeklyScheduledGoals = async (startDate) => {
  try {
    const endDate = getEndDate(startDate);

    // Get all scheduled workouts for this week
    const scheduledWorkouts = await db.getAllAsync(
      `SELECT DISTINCT w.id, w.name,
              (SELECT COUNT(*) FROM exercises WHERE workoutId = w.id) as exerciseCount
       FROM workouts w
       JOIN workout_schedule ws ON w.id = ws.workoutId
       WHERE ws.dayOfWeek >= 0 AND ws.dayOfWeek <= 6`
    );

    // Count total scheduled workout instances for the week
    const scheduleData = await db.getAllAsync(
      `SELECT w.id, ws.dayOfWeek,
              (SELECT COUNT(*) FROM exercises WHERE workoutId = w.id) as exerciseCount
       FROM workouts w
       JOIN workout_schedule ws ON w.id = ws.workoutId
       WHERE ws.dayOfWeek >= 0 AND ws.dayOfWeek <= 6`
    );

    // Calculate totals
    const totalScheduledWorkouts = scheduleData.length;
    const totalScheduledExercises = scheduleData.reduce((sum, item) => sum + (item.exerciseCount || 0), 0);

    // Get completed workouts for this week
    const completedData = await db.getFirstAsync(
      `SELECT
        COUNT(DISTINCT wl.workoutId) as completedWorkouts,
        COUNT(DISTINCT sl.exerciseId) as completedExercises
       FROM workout_logs wl
       LEFT JOIN set_logs sl ON wl.id = sl.workoutLogId
       WHERE wl.logDate >= ? AND wl.logDate <= ? AND wl.status = 'completed'`,
      [startDate, endDate]
    );

    return {
      totalScheduledWorkouts: totalScheduledWorkouts || 0,
      totalScheduledExercises: totalScheduledExercises || 0,
      completedWorkouts: completedData?.completedWorkouts || 0,
      completedExercises: completedData?.completedExercises || 0,
    };
  } catch (error) {
    return {
      totalScheduledWorkouts: 0,
      totalScheduledExercises: 0,
      completedWorkouts: 0,
      completedExercises: 0,
    };
  }
};
