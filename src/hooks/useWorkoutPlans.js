import { useState, useCallback } from 'react';
import {
  getAllWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  updateExerciseInWorkout,
} from '../services/dummyDataPlans';

/**
 * Custom hook for workout plan management
 * Handles creating, editing, and managing workout plans with exercises
 */
export const useWorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all plans
   */
  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getAllWorkouts();
      if (fetchError) throw fetchError;
      setPlans(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load a specific plan
   */
  const loadPlanById = useCallback(async (workoutId) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getWorkoutById(workoutId);
      if (fetchError) throw fetchError;
      setCurrentPlan(data);
    } catch (err) {
      setError(err.message || 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new plan
   */
  const createNewPlan = useCallback(async (planData) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: createError } = await createPlan(planData);
      if (createError) throw createError;
      setPlans((prev) => [data, ...prev]);
      setCurrentPlan(data);
      return { success: true, plan: data };
    } catch (err) {
      setError(err.message || 'Failed to create plan');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update existing plan
   */
  const updateCurrentPlan = useCallback(async (planData) => {
    if (!currentPlan) return { success: false };

    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await updateWorkout(currentPlan.id, planData);
      if (updateError) throw updateError;
      setCurrentPlan(data);
      setPlans((prev) =>
        prev.map((p) => (p.id === currentPlan.id ? data : p))
      );
      return { success: true, plan: data };
    } catch (err) {
      setError(err.message || 'Failed to update plan');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [currentPlan]);

  /**
   * Delete a plan
   */
  const deleteWorkoutById = useCallback(async (workoutId) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await deleteWorkout(workoutId);
      if (deleteError) throw deleteError;
      setPlans((prev) => prev.filter((p) => p.id !== workoutId));
      if (currentPlan?.id === workoutId) {
        setCurrentPlan(null);
      }
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete plan');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [currentPlan]);

  /**
   * Add exercise to current plan
   */
  const addExercise = useCallback(
    async (exerciseData) => {
      if (!currentPlan) return { success: false };

      setLoading(true);
      setError(null);
      try {
        const { data, error: addError } = await addExerciseToPlan(currentPlan.id, exerciseData);
        if (addError) throw addError;

        const updatedPlan = {
          ...currentPlan,
          exercises: [...currentPlan.exercises, data],
        };
        setCurrentPlan(updatedPlan);
        setPlans((prev) =>
          prev.map((p) => (p.id === currentPlan.id ? updatedPlan : p))
        );
        return { success: true, exercise: data };
      } catch (err) {
        setError(err.message || 'Failed to add exercise');
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [currentPlan]
  );

  /**
   * Remove exercise from current plan
   */
  const removeExercise = useCallback(
    async (exerciseId) => {
      if (!currentPlan) return { success: false };

      setLoading(true);
      setError(null);
      try {
        const { error: removeError } = await removeExerciseFromPlan(currentPlan.id, exerciseId);
        if (removeError) throw removeError;

        const updatedPlan = {
          ...currentPlan,
          exercises: currentPlan.exercises.filter((e) => e.id !== exerciseId),
        };
        setCurrentPlan(updatedPlan);
        setPlans((prev) =>
          prev.map((p) => (p.id === currentPlan.id ? updatedPlan : p))
        );
        return { success: true };
      } catch (err) {
        setError(err.message || 'Failed to remove exercise');
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [currentPlan]
  );

  /**
   * Update exercise in current plan
   */
  const updateExercise = useCallback(
    async (exerciseId, exerciseData) => {
      if (!currentPlan) return { success: false };

      setLoading(true);
      setError(null);
      try {
        const { data, error: updateError } = await updateExerciseInPlan(
          currentPlan.id,
          exerciseId,
          exerciseData
        );
        if (updateError) throw updateError;

        const updatedPlan = {
          ...currentPlan,
          exercises: currentPlan.exercises.map((e) =>
            e.id === exerciseId ? data : e
          ),
        };
        setCurrentPlan(updatedPlan);
        setPlans((prev) =>
          prev.map((p) => (p.id === currentPlan.id ? updatedPlan : p))
        );
        return { success: true, exercise: data };
      } catch (err) {
        setError(err.message || 'Failed to update exercise');
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [currentPlan]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    plans,
    currentPlan,
    loading,
    error,
    // Actions
    loadPlans,
    loadPlanById,
    createNewPlan,
    updateCurrentPlan,
    deleteWorkoutById,
    addExercise,
    removeExercise,
    updateExercise,
    clearError,
  };
};
