import React, { createContext, useContext, useState, useCallback } from 'react';
import { createUser, getUser, updateUser } from '@database/repositories/userRepo';
import { toISOString } from '@shared/utils/dateUtils';
import { OnboardingDraft, BMRResult, DisplayGoal, DisplayActivityLevel } from '../types';
import { calculateNutrition } from '../services/onboardingService';
import { ActivityLevel, Gender, Goal, UnitPreference } from '@shared/types/common';

const GOAL_MAP: Record<DisplayGoal, Goal> = {
  'lose-fat': 'lose_weight',
  'build-muscle': 'gain_muscle',
  'recomp': 'maintain',
  'maintain': 'maintain',
  'improve-fitness': 'maintain',
  'endurance': 'maintain',
  'strength': 'gain_muscle',
  'flexibility': 'maintain',
  'general-health': 'maintain',
};

const ACTIVITY_MAP: Record<DisplayActivityLevel, ActivityLevel> = {
  'sedentary': 'sedentary',
  'lightly-active': 'light',
  'moderately-active': 'moderate',
  'very-active': 'active',
  'athlete': 'very_active',
};

function computeAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const INITIAL_DRAFT: OnboardingDraft = {
  name: '',
  dateOfBirth: '',
  gender: 'male',
  heightCm: 170,
  weightKg: 70,
  targetWeightKg: null,
  unitPreference: 'metric',
  activityLevel: '',
  goal: '',
  customCalories: null,
  customProtein: null,
};

interface OnboardingContextValue {
  draft: OnboardingDraft;
  updateDraft: (fields: Partial<OnboardingDraft>) => void;
  getNutritionSummary: () => BMRResult | null;
  completeOnboarding: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(INITIAL_DRAFT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDraft = useCallback((fields: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...fields }));
  }, []);

  const getNutritionSummary = useCallback((): BMRResult | null => {
    if (!draft.gender || !draft.activityLevel || !draft.goal || !draft.dateOfBirth) return null;
    const age = computeAge(draft.dateOfBirth);
    if (age <= 0 || age > 120) return null;

    return calculateNutrition({
      gender: draft.gender as Gender,
      weight: draft.weightKg,
      height: draft.heightCm,
      age,
      activityLevel: ACTIVITY_MAP[draft.activityLevel as DisplayActivityLevel],
      goal: GOAL_MAP[draft.goal as DisplayGoal],
    });
  }, [draft]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const now = toISOString();
      const age = computeAge(draft.dateOfBirth);
      const dbGoal = GOAL_MAP[draft.goal as DisplayGoal];
      const dbActivity = ACTIVITY_MAP[draft.activityLevel as DisplayActivityLevel];

      const isImperial = draft.unitPreference === 'imperial';
      const storedHeight = isImperial
        ? Math.round(draft.heightCm / 2.54)
        : draft.heightCm;
      const storedWeight = isImperial
        ? Math.round(draft.weightKg * 2.20462 * 10) / 10
        : draft.weightKg;

      const storedTargetWeight = draft.targetWeightKg != null
        ? (isImperial ? Math.round(draft.targetWeightKg * 2.20462 * 10) / 10 : draft.targetWeightKg)
        : null;

      const userData = {
        name: draft.name.trim(),
        age,
        gender: draft.gender as Gender,
        height: storedHeight,
        weight: storedWeight,
        activityLevel: dbActivity,
        goal: dbGoal,
        unitPreference: draft.unitPreference as UnitPreference,
        targetWeight: storedTargetWeight,
        experienceLevel: null,
        targetCaloriesOverride: draft.customCalories,
        targetProteinOverride: draft.customProtein,
      };

      const existingUser = await getUser();
      if (existingUser) {
        await updateUser(existingUser.id, { ...userData, updatedAt: now });
      } else {
        await createUser({ ...userData, createdAt: now, updatedAt: now });
      }
      return true;
    } catch {
      setError('Failed to save profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [draft]);

  return (
    <OnboardingContext.Provider
      value={{ draft, updateDraft, getNutritionSummary, completeOnboarding, loading, error }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
