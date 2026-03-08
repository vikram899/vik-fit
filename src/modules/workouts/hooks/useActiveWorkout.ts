import { useState, useCallback, useRef } from 'react';
import { ActiveWorkoutState, ActiveExercise, ActiveSet } from '../types';
import {
  startWorkoutLog,
  logExercise,
  logSet,
  finishWorkoutLog,
} from '../services/workoutLogService';
import { getTemplateWithExercises } from '../services/workoutTemplateService';
import { getAllExercises, getPreviousSets } from '../services/exerciseService';
import { toISOString } from '@shared/utils/dateUtils';

export function useActiveWorkout() {
  const [state, setState] = useState<ActiveWorkoutState | null>(null);
  const [loading, setLoading] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startWorkout = useCallback(async (workoutTemplateId: number) => {
    setLoading(true);
    try {
      const { template, exercises } = await getTemplateWithExercises(workoutTemplateId);
      if (!template) return;

      const workoutLogId = await startWorkoutLog(workoutTemplateId, template.name);
      const allExercises = await getAllExercises();
      const exerciseMap = new Map(allExercises.map((e) => [e.id, e]));

      const activeExercises: ActiveExercise[] = [];
      for (const ex of exercises) {
        const [exerciseLogId, prevSets] = await Promise.all([
          logExercise(workoutLogId, ex.exerciseTemplateId, ex.orderIndex),
          getPreviousSets(ex.exerciseTemplateId),
        ]);
        const template2 = exerciseMap.get(ex.exerciseTemplateId);
        const sets: ActiveSet[] = Array.from({ length: ex.defaultSets }, (_, i) => {
          const prev = prevSets[i];
          return {
            setNumber: i + 1,
            reps: prev?.reps != null ? String(prev.reps) : String(ex.defaultReps),
            weight: prev?.weight != null ? String(prev.weight) : String(ex.defaultWeight),
            completed: false,
          };
        });

        activeExercises.push({
          exerciseLogId,
          exerciseTemplateId: ex.exerciseTemplateId,
          name: template2?.name ?? 'Exercise',
          type: template2?.type ?? 'strength',
          orderIndex: ex.orderIndex,
          sets,
          previousSets: prevSets,
          defaultRestTimeSeconds: ex.defaultRestTimeSeconds,
        });
      }

      setState({
        workoutLogId,
        workoutTemplateId,
        name: template.name,
        startedAt: toISOString(),
        exercises: activeExercises,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, field: Partial<ActiveSet>) => {
      setState((prev) => {
        if (!prev) return prev;
        const exercises = [...prev.exercises];
        const sets = [...exercises[exerciseIndex].sets];
        sets[setIndex] = { ...sets[setIndex], ...field };
        exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
        return { ...prev, exercises };
      });
    },
    []
  );

  const addSet = useCallback((exerciseIndex: number) => {
    setState((prev) => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      const lastSet = exercises[exerciseIndex].sets.at(-1);
      const newSet: ActiveSet = {
        setNumber: (lastSet?.setNumber ?? 0) + 1,
        reps: lastSet?.reps ?? '10',
        weight: lastSet?.weight ?? '0',
        completed: false,
      };
      exercises[exerciseIndex] = {
        ...exercises[exerciseIndex],
        sets: [...exercises[exerciseIndex].sets, newSet],
      };
      return { ...prev, exercises };
    });
  }, []);

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setState((prev) => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      const exercise = exercises[exerciseIndex];
      if (exercise.sets.length <= 1) return prev;
      const sets = exercise.sets
        .filter((_, i) => i !== setIndex)
        .map((s, i) => ({ ...s, setNumber: i + 1 }));
      exercises[exerciseIndex] = { ...exercise, sets };
      return { ...prev, exercises };
    });
  }, []);

  const startRestTimer = useCallback((seconds: number) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimer(seconds);
    restTimerRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(restTimerRef.current!);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const skipRestTimer = useCallback(() => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimer(null);
  }, []);

  const finishWorkout = useCallback(
    async (notes?: string): Promise<number | null> => {
      if (!state) return null;
      setLoading(true);
      try {
        // Save all completed sets
        for (const exercise of state.exercises) {
          for (const set of exercise.sets) {
            await logSet({
              exerciseLogId: exercise.exerciseLogId,
              setNumber: set.setNumber,
              reps: parseInt(set.reps) || null,
              weight: parseFloat(set.weight) || null,
              durationSeconds: null,
              completed: set.completed,
            });
          }
        }
        await finishWorkoutLog(state.workoutLogId, state.startedAt, notes);
        const logId = state.workoutLogId;
        setState(null);
        return logId;
      } finally {
        setLoading(false);
      }
    },
    [state]
  );

  return {
    state,
    loading,
    restTimer,
    startWorkout,
    updateSet,
    addSet,
    removeSet,
    startRestTimer,
    skipRestTimer,
    finishWorkout,
  };
}
