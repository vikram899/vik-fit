/**
 * CUSTOM HOOK: useWeightData
 *
 * Reusable hook for loading and managing weight tracking data.
 * Handles:
 * - Weight entries for a date range
 * - Target weight extraction
 * - Loading state and error handling
 * - Automatic refresh when screen is focused
 *
 * Can be used by multiple screens:
 * - HomeScreen (weight progress graph)
 * - WeightTrackingScreen (full weight history)
 * - ProgressScreen (weight progress view)
 *
 * @example
 * const { weightData, targetWeight, isLoading, error, refreshData } = useWeightData();
 *
 * @example with custom date range
 * const { weightData } = useWeightData({ daysBack: 90 });
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getAllWeightEntries } from '../../services/database';
import { getRecentWeightData, getTargetWeightFromData } from './workoutHelpers';

const DEFAULT_DAYS_BACK = 60; // 2 months
const DEFAULT_TARGET_WEIGHT = 70;

/**
 * Hook for managing weight data
 *
 * @param {Object} options - Configuration options
 *   - daysBack: number of days to look back (default: 60)
 *   - defaultTargetWeight: default weight if no data (default: 70)
 *   - autoRefresh: whether to refresh on screen focus (default: true)
 *
 * @returns {Object} Weight data and control functions
 *   - weightData: Array of weight entries sorted by date
 *   - targetWeight: Current target weight
 *   - isLoading: boolean
 *   - error: null or error object
 *   - refreshData: async function to manually refresh data
 */
export const useWeightData = (options = {}) => {
  const {
    daysBack = DEFAULT_DAYS_BACK,
    defaultTargetWeight = DEFAULT_TARGET_WEIGHT,
    autoRefresh = true,
  } = options;

  const [weightData, setWeightData] = React.useState([]);
  const [targetWeight, setTargetWeight] = React.useState(defaultTargetWeight);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Load weight data for the specified date range
   */
  const loadWeightData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all weight entries from database
      const allWeightEntries = await getAllWeightEntries();

      // Filter to recent entries only
      const recentWeightData = getRecentWeightData(allWeightEntries, daysBack);

      // Extract target weight from latest entry
      const targetWeightValue = getTargetWeightFromData(
        recentWeightData,
        defaultTargetWeight
      );

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setWeightData(recentWeightData);
        setTargetWeight(targetWeightValue);
      }
    } catch (err) {
      console.error('Failed to load weight data:', err);
      if (isMountedRef.current) {
        setError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [daysBack, defaultTargetWeight]);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadWeightData();

    return () => {
      // Cleanup: mark as unmounted to prevent state updates
      isMountedRef.current = false;
    };
  }, [loadWeightData]);

  /**
   * Reload data when screen is focused (if autoRefresh is enabled)
   */
  useFocusEffect(
    useCallback(() => {
      if (!autoRefresh) return;

      isMountedRef.current = true;
      loadWeightData();

      return () => {
        isMountedRef.current = false;
      };
    }, [loadWeightData, autoRefresh])
  );

  /**
   * Public refresh function - allows parent component to manually refresh
   */
  const refreshData = useCallback(async () => {
    await loadWeightData();
  }, [loadWeightData]);

  return {
    weightData,
    targetWeight,
    isLoading,
    error,
    refreshData,
  };
};

export default useWeightData;
