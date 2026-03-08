import {
  getAllExerciseTemplates,
  getExerciseTemplateById,
  createExerciseTemplate,
  deleteExerciseTemplate,
  toggleExerciseFavorite,
  getLastSetLogsForExercise,
} from '@database/repositories/exerciseRepo';
import { toISOString } from '@shared/utils/dateUtils';
import { ExerciseType } from '@shared/types/common';

export async function getAllExercises() {
  return getAllExerciseTemplates();
}

export async function getExerciseById(id: number) {
  return getExerciseTemplateById(id);
}

export async function createExercise(params: {
  name: string;
  type: ExerciseType;
  targetMuscle: string;
  secondaryMuscle?: string;
}): Promise<number> {
  const now = toISOString();
  return createExerciseTemplate({
    name: params.name.trim(),
    type: params.type,
    targetMuscle: params.targetMuscle,
    secondaryMuscle: params.secondaryMuscle ?? null,
    isFavorite: 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function deleteExercise(id: number): Promise<void> {
  return deleteExerciseTemplate(id);
}

export async function getPreviousSets(exerciseTemplateId: number) {
  return getLastSetLogsForExercise(exerciseTemplateId);
}

export async function toggleFavorite(id: number, isFavorite: boolean): Promise<void> {
  return toggleExerciseFavorite(id, isFavorite);
}
