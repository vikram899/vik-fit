import { getUser, updateUser, UserRow } from '@database/repositories/userRepo';
import { calculateNutrition } from '@modules/onboarding/services/onboardingService';
import { ProfileFormData } from '../types';

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
  return calculateNutrition({
    gender: user.gender,
    weight: user.weight,
    height: user.height,
    age: user.age,
    activityLevel: user.activityLevel,
    goal: user.goal,
  });
}
