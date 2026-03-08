export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Goal = 'lose_weight' | 'maintain' | 'gain_muscle';

export type UnitPreference = 'metric' | 'imperial';

export type ExerciseType =
  | 'strength'
  | 'bodyweight'
  | 'cardio'
  | 'flexibility'
  | 'endurance'
  | 'hiit'
  | 'warmup'
  | 'other';

export interface MacroSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
