import { getUser } from '@database/repositories/userRepo';
import { getRecentWeightLogs } from '@database/repositories/weightRepo';
import { getMealLogsByDate, getMealLogDates } from '@database/repositories/mealRepo';
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
import { MacroSummary } from '@shared/types/common';

function computeStreak(mealDates: string[], workoutDates: string[], today: string): number {
  const dateSet = new Set([...mealDates, ...workoutDates]);
  const [y, m, d] = today.split('-').map(Number);
  const checkDate = new Date(Date.UTC(y, m - 1, d));
  let streak = 0;

  while (true) {
    const yyyy = checkDate.getUTCFullYear();
    const mm = String(checkDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(checkDate.getUTCDate()).padStart(2, '0');
    if (dateSet.has(`${yyyy}-${mm}-${dd}`)) {
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

  const [user, mealLogs, todaysWorkoutTemplates, workoutLogsToday, skippedIds, mealDates, workoutDates, recentWeightLogs] =
    await Promise.all([
      getUser(),
      getMealLogsByDate(today),
      getWorkoutTemplatesByWeekday(weekday),
      getWorkoutLogsByDate(today),
      getSkippedWorkoutIdsForDate(today),
      getMealLogDates(),
      getWorkoutCompletedDates(),
      getRecentWeightLogs(10),
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
    const nutrition = calculateNutrition({
      gender: user.gender,
      weight: user.weight,
      height: user.height,
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
      targetCalories: nutrition.targetCalories,
      targetProtein: nutrition.proteinGrams,
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

  const streak = computeStreak(mealDates, workoutDates, today);

  // Weight logs: oldest first for sparkline (reverse the DESC order)
  const weightLogs = recentWeightLogs.map((l) => l.weight).reverse();
  const lastWeightLoggedAt = recentWeightLogs[0]?.loggedAt ?? null; // [0] is most recent (DESC order)

  return {
    user: userTargets,
    todayMacros,
    mealLogs,
    streak,
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
