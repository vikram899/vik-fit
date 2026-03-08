import { ActivityLevel, Gender, Goal, UnitPreference } from '@shared/types/common';

export interface ProfileFormData {
  name: string;
  age: string;
  gender: Gender;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  goal: Goal;
  unitPreference: UnitPreference;
}
