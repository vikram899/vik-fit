import { useState, useCallback, useEffect } from 'react';
import { WorkoutTemplateRow } from '@database/repositories/workoutRepo';
import { ExerciseTemplateRow } from '@database/repositories/exerciseRepo';
import { ExerciseType } from '@shared/types/common';
import {
  getTemplateById,
  getTemplateExercisesWithNames,
  createTemplate,
  updateTemplate,
  addExercise,
  removeExercise,
} from '../services/workoutTemplateService';
import { getAllExercises, createExercise, deleteExercise } from '../services/exerciseService';

export interface PendingSet {
  reps: number;
  weight: number;
}

export interface PendingExercise {
  exerciseTemplateId: number;
  exerciseName: string;
  exerciseType: ExerciseType;
  sets: PendingSet[];
  restTimeSeconds: number;
}

function makeDefaultSets(count: number, reps = 10, weight = 0): PendingSet[] {
  return Array.from({ length: count }, () => ({ reps, weight }));
}

export function useWorkoutEditor(existingTemplateId?: number) {
  const [templateData, setTemplateData] = useState<WorkoutTemplateRow | null>(null);
  const [pendingExercises, setPendingExercises] = useState<PendingExercise[]>([]);
  const [allExercises, setAllExercises] = useState<ExerciseTemplateRow[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllExercises().then(setAllExercises);

    if (existingTemplateId) {
      getTemplateById(existingTemplateId).then((t) => {
        if (t) setTemplateData(t);
      });
      setLoadingExercises(true);
      getTemplateExercisesWithNames(existingTemplateId)
        .then((rows) =>
          setPendingExercises(
            rows.map((r) => ({
              exerciseTemplateId: r.exerciseTemplateId,
              exerciseName: r.exerciseName,
              exerciseType: r.exerciseType,
              sets: makeDefaultSets(r.defaultSets, r.defaultReps, r.defaultWeight),
              restTimeSeconds: r.defaultRestTimeSeconds,
            }))
          )
        )
        .finally(() => setLoadingExercises(false));
    }
  }, [existingTemplateId]);

  const addExerciseToList = useCallback((exercise: ExerciseTemplateRow) => {
    setPendingExercises((prev) => {
      if (prev.some((e) => e.exerciseTemplateId === exercise.id)) return prev;
      return [
        ...prev,
        {
          exerciseTemplateId: exercise.id,
          exerciseName: exercise.name,
          exerciseType: exercise.type,
          sets: makeDefaultSets(3),
          restTimeSeconds: 60,
        },
      ];
    });
  }, []);

  const removeExerciseFromList = useCallback((exerciseTemplateId: number) => {
    setPendingExercises((prev) => prev.filter((e) => e.exerciseTemplateId !== exerciseTemplateId));
  }, []);

  const updateSet = useCallback(
    (exerciseTemplateId: number, setIndex: number, updates: Partial<PendingSet>) => {
      setPendingExercises((prev) =>
        prev.map((e) => {
          if (e.exerciseTemplateId !== exerciseTemplateId) return e;
          const sets = e.sets.map((s, i) => (i === setIndex ? { ...s, ...updates } : s));
          return { ...e, sets };
        })
      );
    },
    []
  );

  const addSet = useCallback((exerciseTemplateId: number) => {
    setPendingExercises((prev) =>
      prev.map((e) => {
        if (e.exerciseTemplateId !== exerciseTemplateId) return e;
        const last = e.sets[e.sets.length - 1] ?? { reps: 10, weight: 0 };
        return { ...e, sets: [...e.sets, { ...last }] };
      })
    );
  }, []);

  const removeSet = useCallback((exerciseTemplateId: number) => {
    setPendingExercises((prev) =>
      prev.map((e) => {
        if (e.exerciseTemplateId !== exerciseTemplateId || e.sets.length <= 1) return e;
        return { ...e, sets: e.sets.slice(0, -1) };
      })
    );
  }, []);

  const updateRestTime = useCallback((exerciseTemplateId: number, restTimeSeconds: number) => {
    setPendingExercises((prev) =>
      prev.map((e) =>
        e.exerciseTemplateId === exerciseTemplateId ? { ...e, restTimeSeconds } : e
      )
    );
  }, []);

  const saveWorkout = useCallback(
    async (name: string, description: string | null, assignedWeekdays: number[]): Promise<boolean> => {
      if (!name.trim()) return false;
      setSaving(true);
      try {
        let templateId: number;

        if (existingTemplateId) {
          await updateTemplate(existingTemplateId, { name, description, assignedWeekdays });
          const existing = await getTemplateExercisesWithNames(existingTemplateId);
          await Promise.all(existing.map((e) => removeExercise(e.id)));
          templateId = existingTemplateId;
        } else {
          templateId = await createTemplate({ name, description, assignedWeekdays, isFavorite: 0 });
        }

        for (let i = 0; i < pendingExercises.length; i++) {
          const ex = pendingExercises[i];
          const firstSet = ex.sets[0] ?? { reps: 10, weight: 0 };
          await addExercise({
            workoutTemplateId: templateId,
            exerciseTemplateId: ex.exerciseTemplateId,
            orderIndex: i,
            defaultSets: ex.sets.length,
            defaultReps: firstSet.reps,
            defaultWeight: firstSet.weight,
            defaultRestTimeSeconds: ex.restTimeSeconds,
          });
        }
        return true;
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [existingTemplateId, pendingExercises]
  );

  const createAndAddExercise = useCallback(
    async (name: string, type: ExerciseType, targetMuscle: string) => {
      const id = await createExercise({ name, type, targetMuscle });
      const updated = await getAllExercises();
      setAllExercises(updated);
      const newEx = updated.find((e) => e.id === id);
      if (newEx) {
        setPendingExercises((prev) => [
          ...prev,
          {
            exerciseTemplateId: newEx.id,
            exerciseName: newEx.name,
            exerciseType: newEx.type,
            sets: makeDefaultSets(3),
            restTimeSeconds: 60,
          },
        ]);
      }
    },
    []
  );

  const deleteExerciseFromLibrary = useCallback(async (id: number) => {
    await deleteExercise(id);
    setAllExercises((prev) => prev.filter((e) => e.id !== id));
    setPendingExercises((prev) => prev.filter((e) => e.exerciseTemplateId !== id));
  }, []);

  return {
    templateData,
    pendingExercises,
    allExercises,
    loadingExercises,
    saving,
    addExerciseToList,
    removeExerciseFromList,
    updateSet,
    addSet,
    removeSet,
    updateRestTime,
    saveWorkout,
    createAndAddExercise,
    deleteExerciseFromLibrary,
  };
}
