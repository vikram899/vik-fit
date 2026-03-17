import {
  createWorkoutLog,
  updateWorkoutLog,
  getWorkoutLogById,
  getRecentWorkoutLogs,
} from '@database/repositories/workoutRepo';
import {
  createExerciseLog,
  getExerciseLogsByWorkoutLogId,
  createSetLog,
  getSetLogsByExerciseLogId,
  updateSetLog,
  getExerciseInfoByIds,
  getHistoricalBestsExcluding,
} from '@database/repositories/exerciseRepo';
import { toISOString } from '@shared/utils/dateUtils';
import { ActiveWorkoutState, ActiveExercise } from '../types';

export async function startWorkoutLog(workoutTemplateId: number | null, name: string): Promise<number> {
  const now = toISOString();
  return createWorkoutLog({
    workoutTemplateId,
    name,
    startedAt: now,
    endedAt: null,
    durationSeconds: null,
    notes: null,
    createdAt: now,
  });
}

export async function finishWorkoutLog(
  workoutLogId: number,
  startedAt: string,
  notes?: string
): Promise<void> {
  const endedAt = toISOString();
  const durationSeconds = Math.round(
    (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
  );
  await updateWorkoutLog(workoutLogId, { endedAt, durationSeconds, notes });
}

export async function logExercise(
  workoutLogId: number,
  exerciseTemplateId: number,
  orderIndex: number
): Promise<number> {
  return createExerciseLog({
    workoutLogId,
    exerciseTemplateId,
    orderIndex,
    createdAt: toISOString(),
  });
}

export async function logSet(params: {
  exerciseLogId: number;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  durationSeconds: number | null;
  completed: boolean;
}): Promise<number> {
  return createSetLog({
    exerciseLogId: params.exerciseLogId,
    setNumber: params.setNumber,
    reps: params.reps,
    weight: params.weight,
    durationSeconds: params.durationSeconds,
    completed: params.completed ? 1 : 0,
    createdAt: toISOString(),
  });
}

export async function markSetCompleted(setLogId: number, completed: boolean): Promise<void> {
  return updateSetLog(setLogId, { completed: completed ? 1 : 0 });
}

export async function getWorkoutSummary(workoutLogId: number) {
  const workoutLog = await getWorkoutLogById(workoutLogId);
  if (!workoutLog) return null;

  const exerciseLogs = await getExerciseLogsByWorkoutLogId(workoutLogId);
  const exercisesWithSets = await Promise.all(
    exerciseLogs.map(async (ex) => ({
      ...ex,
      sets: await getSetLogsByExerciseLogId(ex.id),
    }))
  );

  // Enrich with names, types, PR detection
  const ids = [...new Set(exercisesWithSets.map((e) => e.exerciseTemplateId))];
  const [infoMap, histMap] = await Promise.all([
    getExerciseInfoByIds(ids),
    getHistoricalBestsExcluding(workoutLogId),
  ]);

  const exercises = exercisesWithSets.map((ex) => {
    const info = infoMap.get(ex.exerciseTemplateId);
    const type = info?.type ?? 'strength';
    const hist = histMap.get(ex.exerciseTemplateId);
    const completedSets = ex.sets.filter((s) => s.completed === 1);

    let isPR = false;
    let prValue = '';

    if (completedSets.length > 0) {
      if (['cardio', 'flexibility', 'endurance', 'warmup', 'hiit'].includes(type)) {
        const curBest = Math.max(...completedSets.map((s) => s.durationSeconds ?? 0));
        const prevBest = hist?.bestDuration ?? null;
        isPR = curBest > 0 && (prevBest === null || curBest > prevBest);
        if (isPR) prValue = `${curBest}s`;
      } else if (type === 'bodyweight') {
        const curBest = Math.max(...completedSets.map((s) => s.reps ?? 0));
        const prevBest = hist?.bestReps ?? null;
        isPR = curBest > 0 && (prevBest === null || curBest > prevBest);
        if (isPR) prValue = `${curBest} reps`;
      } else {
        // strength / other — best set by weight
        const curBest = Math.max(...completedSets.map((s) => s.weight ?? 0));
        const prevBest = hist?.bestWeight ?? null;
        isPR = curBest > 0 && (prevBest === null || curBest > prevBest);
        if (isPR) prValue = `${curBest}kg`;
      }
    }

    return {
      ...ex,
      exerciseName: info?.name ?? `Exercise`,
      exerciseType: type,
      isPR,
      prValue,
    };
  });

  return { workoutLog, exercises };
}

export async function getRecentWorkouts(limit: number = 10) {
  return getRecentWorkoutLogs(limit);
}
