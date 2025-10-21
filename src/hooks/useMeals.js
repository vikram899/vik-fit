import { useState, useCallback } from 'react';
// Use dummy data for local development (comment out for Supabase)
import { saveMeal, fetchMeals } from '../services/dummyData';
// For production with Supabase, use:
// import { saveMeal, fetchMeals } from '../services/supabase';
import { getCurrentDate } from '../utils/helpers';

/**
 * Custom hook for meal management
 * Handles saving, fetching, and state management for meals
 */
export const useMeals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Log a new meal
   * @param {Object} mealData - { meal_name, description, meal_type, photo_url }
   * @param {string} userId - Optional user ID
   * @returns {Promise<boolean>} Success status
   */
  const logMeal = useCallback(async (mealData, userId = null) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...mealData,
        created_at: getCurrentDate(),
        user_id: userId,
      };

      const { data, error: saveError } = await saveMeal(payload);

      if (saveError) {
        setError(saveError.message || 'Failed to save meal');
        return false;
      }

      // Add to local state optimistically
      if (data && data[0]) {
        setMeals((prev) => [data[0], ...prev]);
      }

      return true;
    } catch (err) {
      setError(err.message || 'An error occurred while saving meal');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch user's meals
   * @param {string} userId - User ID
   * @param {number} limit - Number of records to fetch
   */
  const getMeals = useCallback(async (userId, limit = 50) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await fetchMeals(userId, limit);

      if (fetchError) {
        setError(fetchError.message || 'Failed to fetch meals');
        return;
      }

      setMeals(data || []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching meals');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Count meals for today
   * @returns {number} Count of today's meals
   */
  const getTodayMealCount = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return meals.filter((meal) => {
      const mealDate = new Date(meal.created_at);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === today.getTime();
    }).length;
  }, [meals]);

  /**
   * Get meals by type
   * @param {string} mealType - Meal type filter
   * @returns {Array} Filtered meals
   */
  const getMealsByType = useCallback(
    (mealType) => {
      return meals.filter((meal) => meal.meal_type === mealType);
    },
    [meals]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    meals,
    loading,
    error,
    logMeal,
    getMeals,
    getTodayMealCount,
    getMealsByType,
    clearError,
  };
};
