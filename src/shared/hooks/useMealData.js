/**
 * CUSTOM HOOK: useMealData
 *
 * Reusable hook for loading and managing meal-related data.
 * Handles:
 * - Daily meal totals for a specific date
 * - Macro goals for a specific date
 * - Loading state and error handling
 * - Automatic refresh when screen is focused
 *
 * Can be used by multiple screens:
 * - HomeScreen (daily summary)
 * - MealProgressScreen (daily breakdown)
 * - LogMealsScreen (current meals)
 * - Any other screen needing meal data
 *
 * @example
 * const { dailyTotals, macroGoals, isLoading, error, refreshData } = useMealData();
 *
 * @example with custom date
 * const { dailyTotals, macroGoals, refreshData } = useMealData('2025-11-05');
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getDailyTotals, getMacroGoals } from '../../services/database';
import { getCurrentDate } from '../utils/dateUtils';

const DEFAULT_MACRO_GOALS = {
  calorieGoal: 2500,
  proteinGoal: 120,
  carbsGoal: 300,
  fatsGoal: 80,
};

/**
 * Hook for managing meal data
 *
 * @param {string} dateOverride - Optional date to load data for (YYYY-MM-DD format)
 * @returns {Object} Meal data and control functions
 *   - dailyTotals: { totalCalories, totalProtein, totalCarbs, totalFats }
 *   - macroGoals: { calorieGoal, proteinGoal, carbsGoal, fatsGoal }
 *   - isLoading: boolean
 *   - error: null or error object
 *   - refreshData: async function to manually refresh data
 *   - date: the date being used for data (for reference)
 */
export const useMealData = (dateOverride = null) => {
  const [dailyTotals, setDailyTotals] = React.useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });

  const [macroGoals, setMacroGoals] = React.useState(DEFAULT_MACRO_GOALS);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Use ref to track if component is mounted (prevents state updates after unmount)
  const isMountedRef = useRef(true);

  /**
   * Load meal data for a specific date
   * Called on mount and when screen is focused
   */
  const loadMealData = useCallback(
    async (dateToLoad = null) => {
      const targetDate = dateToLoad || dateOverride || getCurrentDate();

      setIsLoading(true);
      setError(null);

      try {
        // Fetch totals and goals in parallel for better performance
        const [totals, goals] = await Promise.all([
          getDailyTotals(targetDate),
          getMacroGoals(targetDate),
        ]);

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setDailyTotals(totals);
          setMacroGoals(goals || DEFAULT_MACRO_GOALS);
        }
      } catch (err) {
        console.error('Failed to load meal data:', err);
        if (isMountedRef.current) {
          setError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [dateOverride]
  );

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadMealData();

    return () => {
      // Cleanup: mark as unmounted to prevent state updates
      isMountedRef.current = false;
    };
  }, [loadMealData]);

  /**
   * Reload data when screen is focused
   * Ensures data is always fresh when user navigates back to this screen
   */
  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;
      loadMealData();

      return () => {
        isMountedRef.current = false;
      };
    }, [loadMealData])
  );

  /**
   * Public refresh function - allows parent component to manually refresh
   */
  const refreshData = useCallback(async () => {
    await loadMealData();
  }, [loadMealData]);

  return {
    dailyTotals,
    macroGoals,
    isLoading,
    error,
    refreshData,
    date: dateOverride || getCurrentDate(),
  };
};

export default useMealData;
