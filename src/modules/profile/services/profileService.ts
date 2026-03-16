import { getUser, updateUser, UserRow } from '@database/repositories/userRepo';
import { calculateNutrition } from '@modules/onboarding/services/onboardingService';
import { ProfileFormData } from '../types';
import { StreakCondition } from '@shared/types/common';

export async function getProfile(): Promise<UserRow | null> {
  return getUser();
}

export async function updateProfile(id: number, form: ProfileFormData): Promise<void> {
  await updateUser(id, {
    name: form.name.trim(),
    age: parseInt(form.age, 10),
    gender: form.gender,
    height: parseFloat(form.height),
    weight: parseFloat(form.weight),
    activityLevel: form.activityLevel,
    goal: form.goal,
    unitPreference: form.unitPreference,
  });
}

export function getProfileNutrition(user: UserRow) {
  const isImperial = user.unitPreference === 'imperial';
  return calculateNutrition({
    gender: user.gender,
    weight: isImperial ? user.weight / 2.20462 : user.weight,
    height: isImperial ? user.height * 2.54 : user.height,
    age: user.age,
    activityLevel: user.activityLevel,
    goal: user.goal,
  });
}

export async function updateStreakCondition(id: number, streakCondition: StreakCondition): Promise<void> {
  await updateUser(id, { streakCondition });
}

export async function updateNutritionTargets(
  id: number,
  targetCaloriesOverride: number | null,
  targetProteinOverride: number | null,
): Promise<void> {
  await updateUser(id, { targetCaloriesOverride, targetProteinOverride });
}
