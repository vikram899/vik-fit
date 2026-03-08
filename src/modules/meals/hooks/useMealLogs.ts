import { useState, useEffect, useCallback } from 'react';
import { MealLogRow } from '@database/repositories/mealRepo';
import { getUser } from '@database/repositories/userRepo';
import { getTodaysMealLogs } from '../services/mealLogService';
import { MacroSummary, MealCategory } from '@shared/types/common';
import { calculateNutrition } from '@modules/onboarding/services/onboardingService';

interface UserTargets {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export function useMealLogs() {
  const [logs, setLogs] = useState<MealLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTargets, setUserTargets] = useState<UserTargets | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [result, user] = await Promise.all([getTodaysMealLogs(), getUser()]);
      setLogs(result);
      if (user) {
        const nutrition = calculateNutrition({
          gender: user.gender,
          weight: user.weight,
          height: user.height,
          age: user.age,
          activityLevel: user.activityLevel,
          goal: user.goal,
        });
        setUserTargets({
          targetCalories: nutrition.targetCalories,
          targetProtein: nutrition.proteinGrams,
          targetCarbs: nutrition.carbsGrams,
          targetFat: nutrition.fatGrams,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logsByCategory = useCallback(
    (category: MealCategory) => logs.filter((l) => l.category === category),
    [logs]
  );

  const totalMacros: MacroSummary = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.calories,
      protein: acc.protein + l.protein,
      carbs: acc.carbs + l.carbs,
      fat: acc.fat + l.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { logs, logsByCategory, totalMacros, userTargets, loading, refresh };
}
