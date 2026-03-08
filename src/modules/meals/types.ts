import { MealCategory } from '@shared/types/common';

export interface MealLog {
  id: number;
  templateId: number | null;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: MealCategory;
  eatenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealTemplate {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: MealCategory;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealFormData {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  category: MealCategory;
  eatenAt: string;
  saveAsTemplate: boolean;
}
