import { MacroSummary } from '@shared/types/common';
import { MealLogRow } from '@database/repositories/mealRepo';

export interface DashboardData {
  user: {
    name: string;
    weight: number;
    targetWeight: number | null;
    goal: 'lose_weight' | 'maintain' | 'gain_muscle';
    unitPreference: 'metric' | 'imperial';
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
  } | null;
  weightLogs: number[];
  lastWeightLoggedAt: string | null;
  todayMacros: MacroSummary;
  mealLogs: MealLogRow[];
  streak: number;
  todaysWorkouts: { id: number; name: string; isDone: boolean; exerciseCount: number; completedCount: number }[];
}
