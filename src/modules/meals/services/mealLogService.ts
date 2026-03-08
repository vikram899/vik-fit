import {
  getMealLogsByDate,
  getMealLogsByDateAndCategory,
  getMealLogById,
  createMealLog,
  updateMealLog,
  deleteMealLog,
  getRecentMealLogs,
  MealLogRow,
} from '@database/repositories/mealRepo';
import { toISOString, todayDateString } from '@shared/utils/dateUtils';
import { MealCategory } from '@shared/types/common';
import { MealFormData } from '../types';

export async function getTodaysMealLogs(): Promise<MealLogRow[]> {
  return getMealLogsByDate(todayDateString());
}

export async function getTodaysMealLogsByCategory(category: MealCategory): Promise<MealLogRow[]> {
  return getMealLogsByDateAndCategory(todayDateString(), category);
}

export async function logMeal(form: MealFormData, templateId?: number): Promise<number> {
  const now = toISOString();
  return createMealLog({
    templateId: templateId ?? null,
    name: form.name.trim(),
    calories: parseFloat(form.calories) || 0,
    protein: parseFloat(form.protein) || 0,
    carbs: parseFloat(form.carbs) || 0,
    fat: parseFloat(form.fat) || 0,
    category: form.category,
    eatenAt: form.eatenAt || now,
    createdAt: now,
    updatedAt: now,
  });
}

export async function editMealLog(id: number, form: Partial<MealFormData>): Promise<void> {
  const update: Parameters<typeof updateMealLog>[1] = {};
  if (form.name !== undefined) update.name = form.name.trim();
  if (form.calories !== undefined) update.calories = parseFloat(form.calories) || 0;
  if (form.protein !== undefined) update.protein = parseFloat(form.protein) || 0;
  if (form.carbs !== undefined) update.carbs = parseFloat(form.carbs) || 0;
  if (form.fat !== undefined) update.fat = parseFloat(form.fat) || 0;
  if (form.category !== undefined) update.category = form.category;
  if (form.eatenAt !== undefined) update.eatenAt = form.eatenAt;
  await updateMealLog(id, update);
}

export async function removeMealLog(id: number): Promise<void> {
  return deleteMealLog(id);
}

export async function getMealLogDetail(id: number): Promise<MealLogRow | null> {
  return getMealLogById(id);
}

export async function getRecentMeals(limit: number = 4): Promise<MealLogRow[]> {
  return getRecentMealLogs(limit);
}
