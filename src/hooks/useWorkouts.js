import { useState, useCallback } from 'react';
// Use dummy data for local development (comment out for Supabase)
import { saveWorkout, fetchWorkouts } from '../services/dummyData';
// For production with Supabase, use:
// import { saveWorkout, fetchWorkouts } from '../services/supabase';
import { getCurrentDate } from '../utils/helpers';

/**
 * Custom hook for workout management
 * Handles saving, fetching, and state management for workouts
 */
export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Log a new workout
   * @param {Object} workoutData - { exercise_name, sets, reps, weight }
   * @param {string} userId - Optional user ID
   * @returns {Promise<boolean>} Success status
   */
  const logWorkout = useCallback(async (workoutData, userId = null) => {
    console.log('🏋️ logWorkout hook called with:', workoutData);
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...workoutData,
        created_at: getCurrentDate(),
        user_id: userId,
      };
      console.log('🏋️ Payload prepared:', payload);

      const { data, error: saveError } = await saveWorkout(payload);
      console.log('🏋️ saveWorkout response - data:', data, 'error:', saveError);

      if (saveError) {
        console.error('🏋️ Save error occurred:', saveError);
        setError(saveError.message || 'Failed to save workout');
        return false;
      }

      // Add to local state optimistically
      if (data && data[0]) {
        console.log('🏋️ Adding to local state:', data[0]);
        setWorkouts((prev) => [data[0], ...prev]);
      }

      console.log('🏋️ Workout logged successfully');
      return true;
    } catch (err) {
      console.error('🏋️ Error in logWorkout:', err);
      setError(err.message || 'An error occurred while saving workout');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch user's workouts
   * @param {string} userId - User ID
   * @param {number} limit - Number of records to fetch
   */
  const getWorkouts = useCallback(async (userId, limit = 50) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await fetchWorkouts(userId, limit);

      if (fetchError) {
        setError(fetchError.message || 'Failed to fetch workouts');
        return;
      }

      setWorkouts(data || []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching workouts');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Count workouts for today
   * @returns {number} Count of today's workouts
   */
  const getTodayWorkoutCount = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return workouts.filter((workout) => {
      const workoutDate = new Date(workout.created_at);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === today.getTime();
    }).length;
  }, [workouts]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    workouts,
    loading,
    error,
    logWorkout,
    getWorkouts,
    getTodayWorkoutCount,
    clearError,
  };
};
