/**
 * WORKOUT HELPER FUNCTIONS FOR HOOKS
 *
 * Extracted, reusable logic for combining scheduled and ad-hoc workouts.
 * Used by multiple hooks (useHomeScreenData, useWorkoutData, etc)
 *
 * This eliminates the duplicated 30-line workout loading logic that appeared
 * in HomeScreen.js (lines 73-103 and 167-197).
 */

/**
 * Combine scheduled workouts with ad-hoc workouts (those that have logs)
 *
 * Logic:
 * 1. Start with all scheduled workouts for the day
 * 2. Add any workouts that have logs today but aren't scheduled
 * 3. Sort so incomplete workouts appear first
 * 4. Return combined list and workout logs map
 *
 * @param {Array} scheduledWorkouts - Workouts scheduled for the day
 * @param {Array} allWorkouts - All available workouts
 * @param {Function} getTodayLogForWorkout - Async function to fetch today's log
 * @returns {Promise<{workouts: Array, logsMap: Object}>}
 *
 * @example
 * const { workouts, logsMap } = await combineScheduledAndAdHocWorkouts(
 *   scheduledList,
 *   allWorkoutsList,
 *   getTodayWorkoutLogForWorkout
 * );
 */
export const combineScheduledAndAdHocWorkouts = async (
  scheduledWorkouts,
  allWorkouts,
  getTodayLogForWorkout
) => {
  const combinedWorkouts = [];
  const addedIds = new Set();
  const workoutLogsMap = {};

  // Step 1: Add all scheduled workouts
  if (scheduledWorkouts && scheduledWorkouts.length > 0) {
    for (const workout of scheduledWorkouts) {
      combinedWorkouts.push(workout);
      addedIds.add(workout.id);
    }
  }

  // Step 2: Add ad-hoc workouts (those with logs but not scheduled)
  if (allWorkouts && allWorkouts.length > 0) {
    for (const workout of allWorkouts) {
      try {
        const log = await getTodayLogForWorkout(workout.id);
        if (log) {
          workoutLogsMap[workout.id] = log;
          // Only add if not already added (not scheduled)
          if (!addedIds.has(workout.id)) {
            combinedWorkouts.push(workout);
            addedIds.add(workout.id);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch log for workout ${workout.id}:`, error);
      }
    }
  }

  // Step 3: Load logs for scheduled workouts
  if (scheduledWorkouts && scheduledWorkouts.length > 0) {
    for (const workout of scheduledWorkouts) {
      if (!workoutLogsMap[workout.id]) {
        try {
          const log = await getTodayLogForWorkout(workout.id);
          if (log) {
            workoutLogsMap[workout.id] = log;
          }
        } catch (error) {
          console.warn(`Failed to fetch log for scheduled workout ${workout.id}:`, error);
        }
      }
    }
  }

  // Step 4: Sort - incomplete workouts first, completed ones at the end
  combinedWorkouts.sort((a, b) => {
    const aCompleted = workoutLogsMap[a.id]?.status === 'completed' ? 1 : 0;
    const bCompleted = workoutLogsMap[b.id]?.status === 'completed' ? 1 : 0;
    return aCompleted - bCompleted;
  });

  return {
    workouts: combinedWorkouts,
    logsMap: workoutLogsMap,
  };
};

/**
 * Get recent weight data for a specific date range
 *
 * @param {Array} allWeightEntries - All weight entries from database
 * @param {number} daysBack - Number of days to look back (default: 60)
 * @returns {Array} Filtered weight entries
 *
 * @example
 * const recentWeight = getRecentWeightData(allEntries, 60);
 */
export const getRecentWeightData = (allWeightEntries, daysBack = 60) => {
  if (!allWeightEntries || allWeightEntries.length === 0) {
    return [];
  }

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);
  const startDate = dateThreshold.toISOString().split('T')[0];

  return allWeightEntries.filter((entry) => entry.weightDate >= startDate);
};

/**
 * Get target weight from weight data (uses latest entry)
 *
 * @param {Array} weightData - Weight entries (should be sorted by date, newest first)
 * @param {number} defaultWeight - Default weight if no data available
 * @returns {number} Target weight
 *
 * @example
 * const target = getTargetWeightFromData(weightData, 70);
 */
export const getTargetWeightFromData = (weightData, defaultWeight = 70) => {
  if (!weightData || weightData.length === 0) {
    return defaultWeight;
  }
  return weightData[0].targetWeight || defaultWeight;
};

export default {
  combineScheduledAndAdHocWorkouts,
  getRecentWeightData,
  getTargetWeightFromData,
};
