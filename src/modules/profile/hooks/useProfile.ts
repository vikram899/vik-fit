import { useState, useEffect, useCallback } from 'react';
import { UserRow } from '@database/repositories/userRepo';
import { getWorkoutCompletedDates } from '@database/repositories/workoutRepo';
import { getProfile, updateProfile, getProfileNutrition } from '../services/profileService';
import { ProfileFormData } from '../types';
import { BMRResult } from '@modules/onboarding/types';

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const dateSet = new Set(dates);
  const today = new Date().toISOString().slice(0, 10);

  const walkBack = (start: string) => {
    let streak = 0;
    let cur = start;
    while (dateSet.has(cur)) {
      streak++;
      const d = new Date(cur);
      d.setDate(d.getDate() - 1);
      cur = d.toISOString().slice(0, 10);
    }
    return streak;
  };

  const fromToday = walkBack(today);
  if (fromToday > 0) return fromToday;

  // grace: allow yesterday as current streak day
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return walkBack(yesterday.toISOString().slice(0, 10));
}

export function useProfile() {
  const [user, setUser] = useState<UserRow | null>(null);
  const [nutrition, setNutrition] = useState<BMRResult | null>(null);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [result, completedDates] = await Promise.all([getProfile(), getWorkoutCompletedDates()]);
      setUser(result);
      if (result) setNutrition(getProfileNutrition(result));
      setWorkoutCount(completedDates.length);
      setStreak(calculateStreak(completedDates));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveProfile = useCallback(
    async (form: ProfileFormData): Promise<boolean> => {
      if (!user) return false;
      setSaving(true);
      try {
        await updateProfile(user.id, form);
        await refresh();
        return true;
      } finally {
        setSaving(false);
      }
    },
    [user, refresh]
  );

  return { user, nutrition, workoutCount, streak, loading, saving, saveProfile, refresh };
}
