import { Gender, UnitPreference } from '@shared/types/common';

export type DisplayGoal =
  | 'lose-fat'
  | 'build-muscle'
  | 'recomp'
  | 'maintain'
  | 'improve-fitness'
  | 'endurance'
  | 'strength'
  | 'flexibility'
  | 'general-health';

export type DisplayActivityLevel =
  | 'sedentary'
  | 'lightly-active'
  | 'moderately-active'
  | 'very-active';

export interface OnboardingDraft {
  name: string;
  dateOfBirth: string;      // 'YYYY-MM-DD'
  gender: Gender | '';
  heightCm: number;         // always in cm
  weightKg: number;         // always in kg
  targetWeightKg: number | null;
  unitPreference: UnitPreference;
  activityLevel: DisplayActivityLevel | '';
  goal: DisplayGoal | '';
  customCalories: number | null;  // null = use computed
  customProtein: number | null;   // null = use computed
}

export interface BMRResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}
