import { getUser } from '@database/repositories/userRepo';
import { getRecentWeightLogs, getWeightLogDates } from '@database/repositories/weightRepo';
import { getMealLogsByDate, getMealLogDates, getDailyMacroTotals } from '@database/repositories/mealRepo';
import {
  getWorkoutTemplatesByWeekday,
  getWorkoutLogsByDate,
  getWorkoutProgressForDate,
  getSkippedWorkoutIdsForDate,
  getWorkoutCompletedDates,
} from '@database/repositories/workoutRepo';
import { todayDateString, getCurrentWeekday } from '@shared/utils/dateUtils';
import { calculateNutrition } from '@modules/onboarding/services/onboardingService';
import { DashboardData } from '../types';
import { MacroSummary, StreakCondition } from '@shared/types/common';

function computeStreak(
  condition: StreakCondition,
  today: string,
  opts: {
    mealDates: Set<string>;
    workoutDates: Set<string>;
    weightDates: Set<string>;
    dailyMacros: Map<string, { calories: number; protein: number }>;
    targetCalories: number;
    targetProtein: number;
  }
): number {
  const { mealDates, workoutDates, weightDates, dailyMacros, targetCalories, targetProtein } = opts;

  const qualifies = (date: string): boolean => {
    switch (condition) {
      case 'any':      return mealDates.has(date) || workoutDates.has(date);
      case 'meals':    return mealDates.has(date);
      case 'workout':  return workoutDates.has(date);
      case 'weight':   return weightDates.has(date);
      case 'calories': {
        const m = dailyMacros.get(date);
        return m != null && targetCalories > 0 && m.calories >= targetCalories * 0.9;
      }
      case 'protein': {
        const m = dailyMacros.get(date);
        return m != null && targetProtein > 0 && m.protein >= targetProtein * 0.9;
      }
    }
  };

  const [y, mo, d] = today.split('-').map(Number);
  const checkDate = new Date(Date.UTC(y, mo - 1, d));
  let streak = 0;

  while (true) {
    const yyyy = checkDate.getUTCFullYear();
    const mm = String(checkDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(checkDate.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    if (qualifies(dateStr)) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function getDashboardData(): Promise<DashboardData> {
  const today = todayDateString();
  const weekday = getCurrentWeekday();

  const [user, mealLogs, todaysWorkoutTemplates, workoutLogsToday, skippedIds, mealDates, workoutDates, recentWeightLogs, weightDates, dailyMacroRows] =
    await Promise.all([
      getUser(),
      getMealLogsByDate(today),
      getWorkoutTemplatesByWeekday(weekday),
      getWorkoutLogsByDate(today),
      getSkippedWorkoutIdsForDate(today),
      getMealLogDates(),
      getWorkoutCompletedDates(),
      getRecentWeightLogs(10),
      getWeightLogDates(),
      getDailyMacroTotals(),
    ]);

  const todayMacros: MacroSummary = mealLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  let userTargets = null;
  if (user) {
    const isImperial = user.unitPreference === 'imperial';
    const nutrition = calculateNutrition({
      gender: user.gender,
      weight: isImperial ? user.weight / 2.20462 : user.weight,
      height: isImperial ? user.height * 2.54 : user.height,
      age: user.age,
      activityLevel: user.activityLevel,
      goal: user.goal,
    });
    userTargets = {
      name: user.name,
      weight: user.weight,
      targetWeight: user.targetWeight,
      goal: user.goal,
      unitPreference: user.unitPreference,
      targetCalories: user.targetCaloriesOverride ?? nutrition.targetCalories,
      targetProtein: user.targetProteinOverride ?? nutrition.proteinGrams,
      targetCarbs: nutrition.carbsGrams,
      targetFat: nutrition.fatGrams,
    };
  }

  const skippedSet = new Set(skippedIds);
  const visibleTemplates = todaysWorkoutTemplates.filter((t) => !skippedSet.has(t.id));

  const doneTemplateIds = new Set(
    workoutLogsToday.filter((l) => l.endedAt !== null).map((l) => l.workoutTemplateId)
  );

  const progressResults = await Promise.all(
    visibleTemplates.map((t) => getWorkoutProgressForDate(t.id, today))
  );

  const streakCondition = (user?.streakCondition ?? 'any') as StreakCondition;
  const dailyMacros = new Map(dailyMacroRows.map((r) => [r.date, { calories: r.calories, protein: r.protein }]));
  const streak = computeStreak(streakCondition, today, {
    mealDates: new Set(mealDates),
    workoutDates: new Set(workoutDates),
    weightDates: new Set(weightDates),
    dailyMacros,
    targetCalories: userTargets?.targetCalories ?? 0,
    targetProtein: userTargets?.targetProtein ?? 0,
  });

  // Weight logs: oldest first for sparkline (reverse the DESC order)
  const weightLogs = recentWeightLogs.map((l) => l.weight).reverse();
  const lastWeightLoggedAt = recentWeightLogs[0]?.loggedAt ?? null; // [0] is most recent (DESC order)

  return {
    user: userTargets,
    todayMacros,
    mealLogs,
    streak,
    streakCondition,
    weightLogs,
    lastWeightLoggedAt,
    todaysWorkouts: visibleTemplates.map((t, i) => ({
      id: t.id,
      name: t.name,
      isDone: doneTemplateIds.has(t.id),
      exerciseCount: progressResults[i].exerciseCount,
      completedCount: progressResults[i].completedCount,
    })),
  };
}
