import { ActivityLevel, Gender, Goal, UnitPreference } from '@shared/types/common';

export interface OnboardingDraft {
  name: string;
  age: string;
  gender: Gender | '';
  height: string;
  weight: string;
  unitPreference: UnitPreference;
  activityLevel: ActivityLevel | '';
  goal: Goal | '';
}

export interface BMRResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}
