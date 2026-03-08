import {
  getAllMealTemplates,
  getMealTemplatesByCategory,
  getFavoriteMealTemplates,
  getMealTemplateById,
  createMealTemplate,
  updateMealTemplate,
  toggleMealTemplateFavorite,
  deleteMealTemplate,
} from '@database/repositories/mealTemplateRepo';
import { toISOString } from '@shared/utils/dateUtils';
import { MealCategory } from '@shared/types/common';
import { MealFormData } from '../types';
import { MealLogRow } from '@database/repositories/mealRepo';

export async function getAllTemplates() {
  return getAllMealTemplates();
}

export async function getTemplatesByCategory(category: MealCategory) {
  return getMealTemplatesByCategory(category);
}

export async function getFavoriteTemplates() {
  return getFavoriteMealTemplates();
}

export async function saveTemplate(form: MealFormData): Promise<number> {
  const now = toISOString();
  return createMealTemplate({
    name: form.name.trim(),
    calories: parseFloat(form.calories) || 0,
    protein: parseFloat(form.protein) || 0,
    carbs: parseFloat(form.carbs) || 0,
    fat: parseFloat(form.fat) || 0,
    category: form.category,
    isFavorite: 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function toggleFavorite(id: number, isFavorite: boolean): Promise<void> {
  return toggleMealTemplateFavorite(id, isFavorite);
}

export async function removeTemplate(id: number): Promise<void> {
  return deleteMealTemplate(id);
}

export async function getTemplateById(id: number) {
  return getMealTemplateById(id);
}

export async function saveLogAsTemplate(log: MealLogRow): Promise<number> {
  const now = toISOString();
  return createMealTemplate({
    name: log.name,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    category: log.category,
    isFavorite: 1,
    createdAt: now,
    updatedAt: now,
  });
}
