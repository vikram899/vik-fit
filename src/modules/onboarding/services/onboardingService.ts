import { ActivityLevel, Gender, Goal } from '@shared/types/common';
import { BMRResult } from '../types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose_weight: -500,
  maintain: 0,
  gain_muscle: 300,
};

// Mifflin-St Jeor formula
export function calculateBMR(params: {
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  age: number;
}): number {
  const { gender, weight, height, age } = params;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

export function calculateNutrition(params: {
  gender: Gender;
  weight: number;
  height: number;
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}): BMRResult {
  const bmr = calculateBMR(params);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[params.activityLevel]);
  const targetCalories = tdee + GOAL_ADJUSTMENTS[params.goal];

  // Macro split: 30% protein, 40% carbs, 30% fat
  const proteinGrams = Math.round((targetCalories * 0.3) / 4);
  const carbsGrams = Math.round((targetCalories * 0.4) / 4);
  const fatGrams = Math.round((targetCalories * 0.3) / 9);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
  };
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function cmToInches(cm: number): number {
  return Math.round(cm / 2.54);
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54);
}
