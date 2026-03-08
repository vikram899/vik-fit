import React, { createContext, useContext, useState, useCallback } from 'react';
import { createUser } from '@database/repositories/userRepo';
import { toISOString } from '@shared/utils/dateUtils';
import { OnboardingDraft, BMRResult } from '../types';
import { calculateNutrition } from '../services/onboardingService';
import { ActivityLevel, Gender, Goal, UnitPreference } from '@shared/types/common';

const INITIAL_DRAFT: OnboardingDraft = {
  name: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  unitPreference: 'metric',
  activityLevel: '',
  goal: '',
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
    if (!draft.gender || !draft.activityLevel || !draft.goal) return null;
    const weight = parseFloat(draft.weight);
    const height = parseFloat(draft.height);
    const age = parseInt(draft.age, 10);
    if (isNaN(weight) || isNaN(height) || isNaN(age)) return null;

    return calculateNutrition({
      gender: draft.gender as Gender,
      weight,
      height,
      age,
      activityLevel: draft.activityLevel as ActivityLevel,
      goal: draft.goal as Goal,
    });
  }, [draft]);

  // Single DB write — called only on final step completion
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const now = toISOString();
      await createUser({
        name: draft.name.trim(),
        age: parseInt(draft.age, 10),
        gender: draft.gender as Gender,
        height: parseFloat(draft.height),
        weight: parseFloat(draft.weight),
        activityLevel: draft.activityLevel as ActivityLevel,
        goal: draft.goal as Goal,
        unitPreference: draft.unitPreference as UnitPreference,
        createdAt: now,
        updatedAt: now,
      });
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
