import {
  getAllWorkoutTemplates,
  getAllWorkoutTemplatesWithCounts,
  getWorkoutTemplateById,
  getWorkoutTemplateByWeekday,
  getWorkoutTemplateExercises,
  getWorkoutTemplateExercisesWithNames,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  toggleWorkoutFavorite,
  addExerciseToTemplate,
  removeExerciseFromTemplate,
  updateExerciseOrderInTemplate,
  getLastWorkoutLogForTemplate,
  CreateWorkoutTemplateInput,
  CreateWorkoutTemplateExerciseInput,
} from '@database/repositories/workoutRepo';
import { toISOString } from '@shared/utils/dateUtils';

export async function getAllTemplates() {
  return getAllWorkoutTemplates();
}

export async function getAllTemplatesWithCounts() {
  return getAllWorkoutTemplatesWithCounts();
}

export async function getTemplateById(id: number) {
  return getWorkoutTemplateById(id);
}

export async function getTemplateWithExercises(id: number) {
  const [template, exercises] = await Promise.all([
    getWorkoutTemplateById(id),
    getWorkoutTemplateExercises(id),
  ]);
  return { template, exercises };
}

export async function getTodaysTemplate() {
  const weekday = new Date().getDay();
  const template = await getWorkoutTemplateByWeekday(weekday);
  if (!template) return null;
  const exercises = await getWorkoutTemplateExercises(template.id);
  return { template, exercises };
}

export async function createTemplate(
  input: Omit<CreateWorkoutTemplateInput, 'createdAt' | 'updatedAt'>
): Promise<number> {
  const now = toISOString();
  return createWorkoutTemplate({ ...input, createdAt: now, updatedAt: now });
}

export async function updateTemplate(
  id: number,
  input: Parameters<typeof updateWorkoutTemplate>[1]
): Promise<void> {
  return updateWorkoutTemplate(id, input);
}

export async function deleteTemplate(id: number): Promise<void> {
  return deleteWorkoutTemplate(id);
}

export async function toggleFavorite(id: number, isFavorite: boolean): Promise<void> {
  return toggleWorkoutFavorite(id, isFavorite);
}

export async function addExercise(input: CreateWorkoutTemplateExerciseInput): Promise<number> {
  return addExerciseToTemplate(input);
}

export async function removeExercise(id: number): Promise<void> {
  return removeExerciseFromTemplate(id);
}

export async function reorderExercise(id: number, newIndex: number): Promise<void> {
  return updateExerciseOrderInTemplate(id, newIndex);
}

export async function getTemplateExercisesWithNames(workoutTemplateId: number) {
  return getWorkoutTemplateExercisesWithNames(workoutTemplateId);
}

export async function getLastPerformedLog(workoutTemplateId: number) {
  return getLastWorkoutLogForTemplate(workoutTemplateId);
}
