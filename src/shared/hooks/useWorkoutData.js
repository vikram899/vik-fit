/**
 * CUSTOM HOOK: useWorkoutData
 *
 * Reusable hook for loading and managing workout-related data.
 * Handles:
 * - Today's workouts (combines scheduled + ad-hoc workouts)
 * - Today's workout logs
 * - Combining scheduled and ad-hoc workouts intelligently
 * - Loading state and error handling
 * - Automatic refresh when screen is focused
 *
 * This eliminates the 30-line duplicated workout loading logic from HomeScreen.js
 *
 * Can be used by multiple screens:
 * - HomeScreen (today's workouts summary)
 * - LogWorkoutScreen (list of workouts to log)
 * - WorkoutProgressScreen (workout tracking)
 *
 * @example
 * const { workouts, workoutLogs, isLoading, error, refreshData } = useWorkoutData();
 *
 * @example with specific date
 * const { workouts, workoutLogs } = useWorkoutData({ date: '2025-11-05' });
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  getWorkoutsForDay,
  getTodayWorkoutLogForWorkout,
  getAllWorkouts,
} from '../../services/database';
import { combineScheduledAndAdHocWorkouts } from './workoutHelpers';
import { getCurrentDate } from '../utils/dateUtils';

/**
 * Hook for managing workout data
 *
 * @param {Object} options - Configuration options
 *   - date: specific date to load workouts for (default: today)
 *   - dayOfWeek: specific day of week (0-6, default: today's day)
 *   - autoRefresh: whether to refresh on screen focus (default: true)
 *
 * @returns {Object} Workout data and control functions
 *   - workouts: Array of combined scheduled + ad-hoc workouts
 *   - workoutLogs: Map of workout ID -> workout log { id, status, date, ... }
 *   - isLoading: boolean
 *   - error: null or error object
 *   - refreshData: async function to manually refresh data
 *   - date: the date being used for data
 */
export const useWorkoutData = (options = {}) => {
  const {
    date: dateOverride = null,
    dayOfWeek: dayOverride = null,
    autoRefresh = true,
  } = options;

  const [workouts, setWorkouts] = React.useState([]);
  const [workoutLogs, setWorkoutLogs] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Load workout data for a specific date
   */
  const loadWorkoutData = useCallback(async () => {
    const targetDate = dateOverride || getCurrentDate();
    const dayOfWeek = dayOverride !== null ? dayOverride : new Date().getDay();

    setIsLoading(true);
    setError(null);

    try {
      // Fetch scheduled workouts and all workouts in parallel
      const [scheduledWorkouts, allWorkouts] = await Promise.all([
        getWorkoutsForDay(dayOfWeek),
        getAllWorkouts(),
      ]);

      // Combine scheduled and ad-hoc workouts
      const { workouts: combinedWorkouts, logsMap } =
        await combineScheduledAndAdHocWorkouts(
          scheduledWorkouts,
          allWorkouts,
          getTodayWorkoutLogForWorkout
        );

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setWorkouts(combinedWorkouts);
        setWorkoutLogs(logsMap);
      }
    } catch (err) {
      console.error('Failed to load workout data:', err);
      if (isMountedRef.current) {
        setError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [dateOverride, dayOverride]);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadWorkoutData();

    return () => {
      // Cleanup: mark as unmounted to prevent state updates
      isMountedRef.current = false;
    };
  }, [loadWorkoutData]);

  /**
   * Reload data when screen is focused (if autoRefresh is enabled)
   */
  useFocusEffect(
    useCallback(() => {
      if (!autoRefresh) return;

      isMountedRef.current = true;
      loadWorkoutData();

      return () => {
        isMountedRef.current = false;
      };
    }, [loadWorkoutData, autoRefresh])
  );

  /**
   * Public refresh function - allows parent component to manually refresh
   */
  const refreshData = useCallback(async () => {
    await loadWorkoutData();
  }, [loadWorkoutData]);

  return {
    workouts,
    workoutLogs,
    isLoading,
    error,
    refreshData,
    date: dateOverride || getCurrentDate(),
  };
};

export default useWorkoutData;
