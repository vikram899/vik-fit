/**
 * Workout Statistics and Weekly Summary Functions
 * Calculate weekly completion metrics and trends
 */

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('vikfit.db');

/**
 * Get workout completion count for a specific week
 * @param {number} planId - Plan/Workout ID
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
       WHERE planId = ? AND logDate >= ? AND logDate <= ? AND status = 'completed'`,
      [planId, startDate, endDate]
    );

    return result?.completionCount || 0;
  } catch (error) {
    console.error('Error getting weekly workout completions:', error);
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
        p.id,
        p.name,
        p.description,
        COUNT(DISTINCT ps.dayOfWeek) as assignedDaysCount,
        (SELECT COUNT(*) FROM workout_logs
         WHERE planId = p.id
         AND logDate >= ?
         AND logDate <= ?
         AND status = 'completed') as completionCount
       FROM plans p
       LEFT JOIN plan_schedule ps ON p.id = ps.planId
       GROUP BY p.id`,
      [startDate, getEndDate(startDate)]
    );

    return result || [];
  } catch (error) {
    console.error('Error getting workouts with metrics:', error);
    return [];
  }
};

/**
 * Get exercise count for a specific plan
 */
export const getPlanExerciseCount = async (planId) => {
  try {
    const result = await db.getFirstAsync(
      `SELECT COUNT(*) as exerciseCount FROM exercises WHERE planId = ?`,
      [planId]
    );

    return result?.exerciseCount || 0;
  } catch (error) {
    console.error('Error getting exercise count:', error);
    return 0;
  }
};

/**
 * Get scheduled days for a plan
 */
export const getPlanScheduledDays = async (planId) => {
  try {
    const result = await db.getAllAsync(
      `SELECT dayOfWeek FROM plan_schedule WHERE planId = ? ORDER BY dayOfWeek`,
      [planId]
    );

    return result?.map(r => r.dayOfWeek) || [];
  } catch (error) {
    console.error('Error getting plan scheduled days:', error);
    return [];
  }
};

/**
 * Get Sunday of the week for a given date
 */
export const getSundayOfWeek = (date) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();
  const difference = dateObj.getDate() - dayOfWeek;
  const sunday = new Date(dateObj.setDate(difference));
  return sunday.toISOString().split('T')[0];
};

/**
 * Get end date (Saturday) for a week
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
        COUNT(DISTINCT planId) as workoutsCompleted,
        COALESCE(SUM(exerciseCount), 0) as exercisesCompleted
       FROM (
        SELECT DISTINCT planId,
          (SELECT COUNT(*) FROM exercises WHERE planId = workout_logs.planId) as exerciseCount
        FROM workout_logs
        WHERE logDate >= ? AND logDate <= ? AND status = 'completed'
       )`,
      [startDate, endDate]
    );

    return {
      workoutsCompleted: result?.workoutsCompleted || 0,
      exercisesCompleted: result?.exercisesCompleted || 0,
    };
  } catch (error) {
    console.error('Error getting weekly workout stats:', error);
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
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDateObj);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();

      // Get all assigned workouts for this day of the week
      const assignedWorkouts = await db.getAllAsync(
        `SELECT DISTINCT p.id, p.name
         FROM plans p
         JOIN plan_schedule ps ON p.id = ps.planId
         WHERE ps.dayOfWeek = ?`,
        [dayOfWeek]
      );

      // Get all completed workouts for this day
      const completedWorkouts = await db.getAllAsync(
        `SELECT DISTINCT
          p.id,
          p.name,
          COUNT(e.id) as exerciseCount
         FROM workout_logs wl
         JOIN plans p ON wl.planId = p.id
         LEFT JOIN exercises e ON p.id = e.planId
         WHERE wl.logDate = ? AND wl.status = 'completed'
         GROUP BY p.id`,
        [dateStr]
      );

      weekData.push({
        date: dateStr,
        day: dayNames[i],
        dayNumber: i,
        assignedWorkouts: assignedWorkouts || [],
        totalWorkoutsAssigned: (assignedWorkouts || []).length,
        completedWorkouts: completedWorkouts || [],
        totalWorkoutsCompleted: (completedWorkouts || []).length,
      });
    }

    return weekData;
  } catch (error) {
    console.error('Error getting weekly workout breakdown:', error);
    return [];
  }
};
