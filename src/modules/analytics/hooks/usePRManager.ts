import { useState, useCallback, useEffect } from 'react';
import { getTrackedPRExercises, addTrackedPRExercise, removeTrackedPRExercise, TrackedPRExercise } from '@database/repositories/prRepo';
import { getAllWorkoutTemplatesWithCounts, getWorkoutTemplateExercisesWithNames, WorkoutTemplateWithCountRow, WorkoutTemplateExerciseWithName } from '@database/repositories/workoutRepo';

export function usePRManager() {
  const [tracked, setTracked] = useState<TrackedPRExercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutTemplateWithCountRow[]>([]);
  const [exercises, setExercises] = useState<WorkoutTemplateExerciseWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExercises, setLoadingExercises] = useState(false);

  const loadTracked = useCallback(async () => {
    setLoading(true);
    try {
      const [t, w] = await Promise.all([
        getTrackedPRExercises(),
        getAllWorkoutTemplatesWithCounts(),
      ]);
      setTracked(t);
      setWorkouts(w);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTracked(); }, [loadTracked]);

  const loadExercisesForWorkout = useCallback(async (workoutTemplateId: number) => {
    setLoadingExercises(true);
    try {
      const exs = await getWorkoutTemplateExercisesWithNames(workoutTemplateId);
      setExercises(exs);
    } finally {
      setLoadingExercises(false);
    }
  }, []);

  const addExercise = useCallback(async (exerciseTemplateId: number) => {
    await addTrackedPRExercise(exerciseTemplateId);
    await loadTracked();
  }, [loadTracked]);

  const removeExercise = useCallback(async (exerciseTemplateId: number) => {
    await removeTrackedPRExercise(exerciseTemplateId);
    await loadTracked();
  }, [loadTracked]);

  const trackedIds = new Set(tracked.map(t => t.exerciseTemplateId));

  return { tracked, workouts, exercises, loading, loadingExercises, trackedIds, loadExercisesForWorkout, addExercise, removeExercise };
}
