import { getUser, updateUser } from '@database/repositories/userRepo';
import { getTrackedPRExercises } from '@database/repositories/prRepo';
import {
  getWeightLogsForPeriod,
  getDailyCaloriesForPeriod,
  getTopExerciseMaxWeights,
  getStrengthComparison,
  getTopExerciseDailyMax,
  StrengthDailyPoint,
  getPersonalRecords as getPersonalRecordsFromRepo,
  getCompletedWorkoutCount,
  getWorkoutDatesForPeriod,
  getDailyMealTotalsForMonth,
  getCompletedWorkoutDatesForMonth,
  getDailyMealTotalsForPeriod,
  getTemplatesForConsistency,
  WeightLogPoint,
  DailyCaloriesPoint,
  WorkoutDatePoint,
  DailyMealPoint,
} from '@database/repositories/analyticsRepo';
import {
  Period, ChartData, AnalyticsData, PersonalRecord,
  GoalCalendarData, DayGoalStatus, GoalStatus,
  ProgressSummary, ConsistencyData, GoalHitData, GoalThresholds,
  StrengthComparisonRow, Insight,
} from '../types';

// ── Date helpers ───────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** YYYY-MM-DD string for N days ago */
function daysAgo(n: number): string {
  return isoDate(addDays(new Date(), -n));
}

function weeksInPeriod(period: Period): number {
  return period === 'week' ? 1 : period === 'month' ? 4 : 52;
}

// ── Weight chart builders ──────────────────────────────────────────────────

function buildWeightChartWeek(logs: WeightLogPoint[], fallback: number): ChartData {
  const today = new Date();
  const slots: string[] = [];
  for (let i = 6; i >= 0; i--) slots.push(isoDate(addDays(today, -i)));

  // latest weight per day (logs are ASC so later entries overwrite earlier)
  const byDate = new Map<string, number>();
  for (const l of logs) byDate.set(l.date, l.weight);

  const values: number[] = new Array(7).fill(0);
  for (let i = 0; i < 7; i++) {
    values[i] = byDate.get(slots[i]) ?? 0;
  }

  // forward-fill
  for (let i = 1; i < 7; i++) {
    if (values[i] === 0 && values[i - 1] !== 0) values[i] = values[i - 1];
  }
  // backward-fill
  for (let i = 5; i >= 0; i--) {
    if (values[i] === 0 && values[i + 1] !== 0) values[i] = values[i + 1];
  }
  // if still zeros (no logs this week) use fallback
  for (let i = 0; i < 7; i++) {
    if (values[i] === 0) values[i] = fallback;
  }

  const labels = slots.map(s => DAY_NAMES[new Date(s + 'T12:00:00').getDay()]);
  return { labels, values };
}

function buildWeightChartMonth(logs: WeightLogPoint[], fallback: number): ChartData {
  // 4 weekly buckets: bucket i = days [today-27+7i .. today-21+7i]
  const today = new Date();
  const labels: string[] = [];
  const values: number[] = [];

  for (let w = 0; w < 4; w++) {
    const start = isoDate(addDays(today, -(27 - w * 7)));
    const end   = isoDate(addDays(today, -(21 - w * 7)));
    const bucket = logs.filter(l => l.date >= start && l.date <= end);

    const d = addDays(today, -(27 - w * 7));
    labels.push(`${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`);

    if (bucket.length > 0) {
      values.push(bucket.reduce((s, l) => s + l.weight, 0) / bucket.length);
    } else {
      values.push(values.length > 0 ? values[values.length - 1] : fallback);
    }
  }
  return { labels, values };
}

function buildWeightChartYear(logs: WeightLogPoint[], fallback: number): ChartData {
  const today = new Date();
  const labels: string[] = [];
  const values: number[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    labels.push(MONTH_NAMES[d.getMonth()]);

    const bucket = logs.filter(l => l.date.startsWith(monthStr));
    if (bucket.length > 0) {
      values.push(bucket.reduce((s, l) => s + l.weight, 0) / bucket.length);
    } else {
      values.push(values.length > 0 ? values[values.length - 1] : fallback);
    }
  }
  return { labels, values };
}

// ── Calorie chart builders ─────────────────────────────────────────────────

function buildCaloriesChartWeek(rows: DailyCaloriesPoint[]): ChartData {
  const today = new Date();
  const slots: string[] = [];
  for (let i = 6; i >= 0; i--) slots.push(isoDate(addDays(today, -i)));

  const byDate = new Map<string, number>();
  for (const r of rows) byDate.set(r.date, r.totalCalories);

  const values = slots.map(s => Math.round(byDate.get(s) ?? 0));
  const labels = slots.map(s => DAY_NAMES[new Date(s + 'T12:00:00').getDay()]);
  return { labels, values };
}

function buildCaloriesChartMonth(rows: DailyCaloriesPoint[]): ChartData {
  const today = new Date();
  const labels: string[] = [];
  const values: number[] = [];

  for (let w = 0; w < 4; w++) {
    const start = isoDate(addDays(today, -(27 - w * 7)));
    const end   = isoDate(addDays(today, -(21 - w * 7)));
    const bucket = rows.filter(r => r.date >= start && r.date <= end);

    const d = addDays(today, -(27 - w * 7));
    labels.push(`${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`);
    values.push(Math.round(bucket.reduce((s, r) => s + r.totalCalories, 0)));
  }
  return { labels, values };
}

function buildCaloriesChartYear(rows: DailyCaloriesPoint[]): ChartData {
  const today = new Date();
  const labels: string[] = [];
  const values: number[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    labels.push(MONTH_NAMES[d.getMonth()]);

    const bucket = rows.filter(r => r.date.startsWith(monthStr));
    const total = bucket.reduce((s, r) => s + r.totalCalories, 0);
    values.push(Math.round(total));
  }
  return { labels, values };
}

// ── Strength chart builder ─────────────────────────────────────────────────

function buildStrengthChart(
  rows: { exerciseName: string; maxWeight: number }[]
): ChartData {
  const labels = rows.map(r => {
    const first = r.exerciseName.split(' ')[0];
    return first.length > 7 ? first.slice(0, 7) : first;
  });
  const values = rows.map(r => Math.round(r.maxWeight));
  return { labels, values };
}

// ── Workout frequency chart builders ──────────────────────────────────────

function buildWorkoutsChartWeek(rows: WorkoutDatePoint[]): ChartData {
  const today = new Date();
  const slots: string[] = [];
  for (let i = 6; i >= 0; i--) slots.push(isoDate(addDays(today, -i)));
  const byDate = new Map(rows.map((r) => [r.date, r.count]));
  return {
    labels: slots.map((s) => DAY_NAMES[new Date(s + 'T12:00:00').getDay()]),
    values: slots.map((s) => byDate.get(s) ?? 0),
  };
}

function buildWorkoutsChartMonth(rows: WorkoutDatePoint[]): ChartData {
  const today = new Date();
  const labels: string[] = [];
  const values: number[] = [];
  for (let w = 0; w < 4; w++) {
    const start = isoDate(addDays(today, -(27 - w * 7)));
    const end   = isoDate(addDays(today, -(21 - w * 7)));
    const bucket = rows.filter((r) => r.date >= start && r.date <= end);
    const d = addDays(today, -(27 - w * 7));
    labels.push(`${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`);
    values.push(bucket.reduce((s, r) => s + r.count, 0));
  }
  return { labels, values };
}

function buildWorkoutsChartYear(rows: WorkoutDatePoint[]): ChartData {
  const today = new Date();
  const labels: string[] = [];
  const values: number[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    labels.push(MONTH_NAMES[d.getMonth()]);
    values.push(rows.filter((r) => r.date.startsWith(monthStr)).reduce((s, r) => s + r.count, 0));
  }
  return { labels, values };
}

// ── Strength progression chart builders ───────────────────────────────────

/** Forward-fill zeros so the line doesn't drop to 0 on rest days */
function ffill(values: number[]): number[] {
  for (let i = 1; i < values.length; i++) {
    if (values[i] === 0 && values[i - 1] !== 0) values[i] = values[i - 1];
  }
  return values;
}

function buildStrengthProgressionWeek(rows: StrengthDailyPoint[]): ChartData {
  const today = new Date();
  const slots: string[] = [];
  for (let i = 6; i >= 0; i--) slots.push(isoDate(addDays(today, -i)));
  const byDate = new Map(rows.map(r => [r.date, r.maxWeight]));
  const values = ffill(slots.map(s => byDate.get(s) ?? 0));
  return { labels: slots.map(s => DAY_NAMES[new Date(s + 'T12:00:00').getDay()]), values };
}

function buildStrengthProgressionMonth(rows: StrengthDailyPoint[]): ChartData {
  const today = new Date();
  const labels: string[] = [];
  const values: number[] = [];
  for (let w = 0; w < 4; w++) {
    const start = isoDate(addDays(today, -(27 - w * 7)));
    const end   = isoDate(addDays(today, -(21 - w * 7)));
    const bucket = rows.filter(r => r.date >= start && r.date <= end);
    const d = addDays(today, -(27 - w * 7));
    labels.push(`${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`);
    values.push(bucket.length > 0 ? Math.max(...bucket.map(r => r.maxWeight)) : 0);
  }
  return { labels, values: ffill(values) };
}

function buildStrengthProgressionYear(rows: StrengthDailyPoint[]): ChartData {
  const today = new Date();
  const labels: string[] = [];
  const values: number[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    labels.push(MONTH_NAMES[d.getMonth()]);
    const bucket = rows.filter(r => r.date.startsWith(monthStr));
    values.push(bucket.length > 0 ? Math.max(...bucket.map(r => r.maxWeight)) : 0);
  }
  return { labels, values: ffill(values) };
}

// ── TDEE / target helpers ──────────────────────────────────────────────────

/** Mifflin-St Jeor TDEE + goal-based targets */
function computeTargets(user: NonNullable<Awaited<ReturnType<typeof getUser>>>) {
  const { weight, height, age, gender, activityLevel, goal } = user;

  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const multiplier: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  const tdee = bmr * (multiplier[activityLevel] ?? 1.55);
  const adj  = goal === 'lose_weight' ? -500 : goal === 'gain_muscle' ? 300 : 0;

  return {
    targetCalories: user.targetCaloriesOverride ?? Math.round(tdee + adj),
    targetProtein:  user.targetProteinOverride  ?? Math.round(weight * 1.6),
  };
}

// ── Insight engine ─────────────────────────────────────────────────────────

function buildInsights(params: {
  goal: string;
  direction: 'losing' | 'gaining' | 'maintaining';
  weightChange: number;
  weeklyRate: number;
  weeksToGoal: number | null;
  consistency: { score: number; completed: number; scheduled: number };
  goalHit: { calorieDaysHit: number; calorieDaysTracked: number; proteinDaysHit: number; proteinDaysTracked: number; targetProtein: number };
  periodLabel: string;
  hasWeightData: boolean;
  hasMealData: boolean;
  unitLabel: string;
}): Insight[] {
  const { goal, direction, weightChange, weeklyRate, weeksToGoal, consistency, goalHit, periodLabel, hasWeightData, hasMealData, unitLabel } = params;
  const result: Insight[] = [];

  if (!hasWeightData) {
    result.push({ type: 'info', title: 'Log your weight', body: 'Weigh yourself regularly to track your progress over time.' });
  } else if (goal === 'lose_weight' && direction === 'losing') {
    result.push({ type: 'success', title: 'Weight is dropping ↓', body: `Down ${Math.abs(weightChange).toFixed(1)} ${unitLabel} in ${periodLabel}. Keep it up!` });
  } else if (goal === 'lose_weight' && direction === 'gaining') {
    result.push({ type: 'warning', title: 'Weight is going up', body: `Up ${weightChange.toFixed(1)} ${unitLabel} this ${periodLabel}. Try reducing calorie intake.` });
  } else if (goal === 'lose_weight' && direction === 'maintaining') {
    result.push({ type: 'info', title: 'Weight is stable', body: 'To lose weight, create a small calorie deficit (eat ~300–500 cal less/day).' });
  } else if (goal === 'gain_muscle' && direction === 'gaining') {
    result.push({ type: 'success', title: 'Gaining mass ↑', body: `Up ${weightChange.toFixed(1)} ${unitLabel} in ${periodLabel}. Protein + training is working.` });
  } else if (goal === 'gain_muscle' && direction === 'losing') {
    result.push({ type: 'warning', title: 'Weight dropping', body: 'Your goal is muscle gain but weight is falling. Increase calorie intake.' });
  } else if (goal === 'maintain' && direction === 'maintaining') {
    result.push({ type: 'success', title: 'Maintaining weight', body: 'Weight is stable — right on target for your goal.' });
  }

  if (weeksToGoal !== null && weeksToGoal > 0 && Math.abs(weeklyRate) > 0.01) {
    const months = Math.round(weeksToGoal / 4.3);
    const timeStr = months < 1 ? `${weeksToGoal} week${weeksToGoal > 1 ? 's' : ''}` : months === 1 ? '~1 month' : `~${months} months`;
    result.push({ type: 'info', title: 'Goal estimate', body: `At your current rate, you'll reach your target weight in ${timeStr}.` });
  }

  // ── Workouts
  if (consistency.scheduled === 0) {
    result.push({ type: 'info', title: 'Schedule workouts', body: 'Assign workouts to days of the week to track your consistency.' });
  } else if (consistency.score >= 80) {
    result.push({ type: 'success', title: 'Workout streak 💪', body: `${consistency.completed} of ${consistency.scheduled} scheduled workouts completed. Excellent consistency!` });
  } else if (consistency.score >= 50) {
    result.push({ type: 'info', title: 'Workout consistency', body: `${consistency.completed} of ${consistency.scheduled} scheduled workouts done. A little more effort and you'll hit 80%+.` });
  } else {
    result.push({ type: 'warning', title: 'Low workout consistency', body: `Only ${consistency.completed} of ${consistency.scheduled} scheduled workouts completed. Try sticking to your plan.` });
  }

  // ── Calories & Protein
  if (!hasMealData) {
    result.push({ type: 'info', title: 'Track your meals', body: 'Log what you eat to understand if nutrition is holding back your progress.' });
  } else {
    const calHitRate  = goalHit.calorieDaysTracked >= 3 ? goalHit.calorieDaysHit  / goalHit.calorieDaysTracked  : null;
    const protHitRate = goalHit.proteinDaysTracked >= 3 ? goalHit.proteinDaysHit / goalHit.proteinDaysTracked : null;

    if (calHitRate !== null) {
      if (calHitRate >= 0.75) {
        result.push({ type: 'success', title: 'Calories on target 🎯', body: `Hitting your calorie range ${Math.round(calHitRate * 100)}% of tracked days. Keep it consistent!` });
      } else if (calHitRate < 0.4) {
        result.push({ type: 'warning', title: 'Calorie target often missed', body: `Only ${Math.round(calHitRate * 100)}% of days in range. Check your target in Profile → Nutrition Targets.` });
      } else {
        result.push({ type: 'info', title: 'Room to improve calories', body: `Hitting calorie range ${Math.round(calHitRate * 100)}% of days. Aim for 75%+ for steady results.` });
      }
    }

    if (protHitRate !== null) {
      if (protHitRate >= 0.75) {
        result.push({ type: 'success', title: 'Protein on track ✅', body: `Meeting your protein goal ${Math.round(protHitRate * 100)}% of days. Great for muscle retention!` });
      } else if (protHitRate < 0.5) {
        result.push({ type: 'warning', title: 'Protein too low', body: `Hitting protein goal only ${Math.round(protHitRate * 100)}% of days. Aim for ${goalHit.targetProtein}g/day consistently.` });
      } else {
        result.push({ type: 'info', title: 'Protein needs work', body: `Protein goal hit ${Math.round(protHitRate * 100)}% of days. Try adding a protein-rich snack to close the gap.` });
      }
    }
  }

  return result;
}

// ── Main service ───────────────────────────────────────────────────────────

export async function getAnalyticsData(period: Period): Promise<AnalyticsData> {
  const user = await getUser();
  const imperial = user?.unitPreference === 'imperial';
  const unitLabel = imperial ? 'lbs' : 'kg';
  const fallbackWeight = user?.weight ?? 0;

  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const fromDate     = daysAgo(periodDays - 1);
  const prevFromDate = daysAgo(periodDays * 2 - 1);

  const safe = <T>(p: Promise<T>, fallback: T): Promise<T> =>
    p.catch((e) => { console.warn('[analytics]', e); return fallback; });

  const trackedPRs = await safe(getTrackedPRExercises(), []);
  const trackedIds = trackedPRs.length > 0 ? trackedPRs.map(r => r.exerciseTemplateId) : undefined;

  const [weightLogs, calorieLogs, strengthRows, strengthCmp, strengthDaily, prRows, workoutCount, workoutDates, mealTotals, templateRows] = await Promise.all([
    safe(getWeightLogsForPeriod(fromDate), []),
    safe(getDailyCaloriesForPeriod(fromDate), []),
    safe(getTopExerciseMaxWeights(fromDate, 5), []),
    safe(getStrengthComparison(fromDate, prevFromDate, 6), []),
    safe(getTopExerciseDailyMax(fromDate), []),
    safe(getPersonalRecordsFromRepo(10, trackedIds), []),
    safe(getCompletedWorkoutCount(fromDate), 0),
    safe(getWorkoutDatesForPeriod(fromDate), []),
    safe(getDailyMealTotalsForPeriod(fromDate), []),
    safe(getTemplatesForConsistency(), []),
  ]);

  // ── Weight chart ──
  const hasWeightData = weightLogs.length > 0;
  let weightChart: ChartData;
  if (period === 'week') weightChart = buildWeightChartWeek(weightLogs, fallbackWeight);
  else if (period === 'month') weightChart = buildWeightChartMonth(weightLogs, fallbackWeight);
  else weightChart = buildWeightChartYear(weightLogs, fallbackWeight);

  // ── Calorie chart ──
  const hasCaloriesData = calorieLogs.some(r => r.totalCalories > 0);
  let caloriesChart: ChartData;
  if (period === 'week') caloriesChart = buildCaloriesChartWeek(calorieLogs);
  else if (period === 'month') caloriesChart = buildCaloriesChartMonth(calorieLogs);
  else caloriesChart = buildCaloriesChartYear(calorieLogs);

  // ── Strength chart ──
  const hasStrengthData = strengthRows.length > 0;
  const strengthChart = buildStrengthChart(strengthRows);

  // ── Strength progression chart (time-series for top exercise) ──
  const topStrengthExercise = strengthDaily.length > 0 ? strengthDaily[0].exerciseName : '';
  let strengthProgressionChart: ChartData;
  if (period === 'week') strengthProgressionChart = buildStrengthProgressionWeek(strengthDaily);
  else if (period === 'month') strengthProgressionChart = buildStrengthProgressionMonth(strengthDaily);
  else strengthProgressionChart = buildStrengthProgressionYear(strengthDaily);
  const hasStrengthProgressionData = strengthDaily.length > 0;

  // ── Workouts frequency chart ──
  const hasWorkoutsData = workoutDates.length > 0;
  let workoutsChart: ChartData;
  if (period === 'week') workoutsChart = buildWorkoutsChartWeek(workoutDates);
  else if (period === 'month') workoutsChart = buildWorkoutsChartMonth(workoutDates);
  else workoutsChart = buildWorkoutsChartYear(workoutDates);

  // ── Personal records ──
  const DURATION_TYPES = ['cardio', 'flexibility', 'endurance', 'warmup', 'hiit'];
  const personalRecords: PersonalRecord[] = prRows.map((r) => {
    let bestValue: number;
    let metricLabel: string;
    if (DURATION_TYPES.includes(r.exerciseType)) {
      bestValue = r.maxDuration ?? 0;
      metricLabel = 'sec';
    } else if (r.exerciseType === 'bodyweight') {
      bestValue = r.maxReps ?? 0;
      metricLabel = 'reps';
    } else {
      bestValue = r.maxWeight ?? 0;
      metricLabel = unitLabel;
    }
    return { exerciseName: r.exerciseName, exerciseType: r.exerciseType, bestValue, metricLabel, achievedAt: r.achievedAt };
  }).filter((r) => r.bestValue > 0);

  // ── Stats ──
  const firstWeight = weightLogs.length > 0 ? weightLogs[0].weight : fallbackWeight;
  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : fallbackWeight;
  const weightChange = latestWeight - firstWeight;
  const weightChangePct = firstWeight > 0 ? (weightChange / firstWeight) * 100 : 0;
  const avgWorkoutsPerWeek = workoutCount / weeksInPeriod(period);

  // ── Target calories / protein ──
  const { targetCalories: tc, targetProtein: tp } = user
    ? computeTargets(user)
    : { targetCalories: 2000, targetProtein: 130 };

  // ── Progress summary ──
  const weeksCount = weeksInPeriod(period);
  const weeklyRate = hasWeightData && weeksCount > 0 ? weightChange / weeksCount : 0;
  const targetWeight = user?.targetWeight ?? null;
  let weeksToGoal: number | null = null;
  if (targetWeight !== null && Math.abs(weeklyRate) > 0.01) {
    const remaining = targetWeight - latestWeight;
    if ((remaining < 0 && weeklyRate < 0) || (remaining > 0 && weeklyRate > 0)) {
      weeksToGoal = Math.ceil(Math.abs(remaining / weeklyRate));
    }
  }
  const direction: 'losing' | 'gaining' | 'maintaining' =
    weightChange < -0.2 ? 'losing' : weightChange > 0.2 ? 'gaining' : 'maintaining';

  const progress: ProgressSummary = {
    direction,
    weightChange,
    weeklyRate,
    currentWeight: latestWeight,
    targetWeight,
    weeksToGoal,
    goalLabel: (user?.goal ?? 'maintain') as 'lose_weight' | 'maintain' | 'gain_muscle',
  };

  // ── Consistency ──
  const today = new Date();
  const calendarDays: Date[] = [];
  for (let i = periodDays - 1; i >= 0; i--) {
    calendarDays.push(addDays(today, -i));
  }
  const assignedWeekdaySet = new Set<number>();
  for (const row of templateRows) {
    try {
      const days: number[] = row.assignedWeekdays ? JSON.parse(row.assignedWeekdays) : [];
      days.forEach(d => assignedWeekdaySet.add(d));
    } catch {}
  }
  const scheduledDates = calendarDays.filter(d => assignedWeekdaySet.has(d.getDay()));
  const scheduledCount = scheduledDates.length;
  const completedDatesSet = new Set(workoutDates.map(r => r.date));
  const completedCount = scheduledDates.filter(d => completedDatesSet.has(isoDate(d))).length;
  const consistencyScore = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

  const consistency: ConsistencyData = {
    score: consistencyScore,
    completed: completedCount,
    scheduled: scheduledCount,
  };

  // ── Goal hits ──
  const mealMap = new Map<string, DailyMealPoint>();
  for (const m of mealTotals) mealMap.set(m.date, m);

  let calorieDaysHit = 0, calorieDaysTracked = 0, proteinDaysHit = 0, proteinDaysTracked = 0;
  const hasMealData = mealTotals.length > 0;
  const todayStr = isoDate(today);
  const calThreshold      = (user?.calorieGoalPct ?? 85) / 100;
  const calUpperThreshold = (user?.calorieGoalUpperPct ?? 115) / 100;
  const protThreshold     = (user?.proteinGoalPct ?? 85) / 100;

  for (const d of calendarDays) {
    const ds = isoDate(d);
    if (ds > todayStr) continue;
    const meal = mealMap.get(ds);
    if (meal && meal.totalCalories > 0) {
      calorieDaysTracked++;
      const calPct = meal.totalCalories / tc;
      if (calPct >= calThreshold && calPct <= calUpperThreshold) calorieDaysHit++;
    }
    if (meal && meal.totalProtein > 0) {
      proteinDaysTracked++;
      if (meal.totalProtein >= tp * protThreshold) proteinDaysHit++;
    }
  }

  const goalHit: GoalHitData = {
    calorieDaysHit,
    calorieDaysTracked,
    proteinDaysHit,
    proteinDaysTracked,
    targetCalories: tc,
    targetProtein: tp,
  };

  // ── Insights ──
  const periodLabel = period === 'week' ? 'week' : period === 'month' ? 'month' : 'year';
  const insights = buildInsights({
    goal: user?.goal ?? 'maintain',
    direction,
    weightChange,
    weeklyRate,
    weeksToGoal,
    consistency,
    goalHit,
    periodLabel,
    hasWeightData,
    hasMealData,
    unitLabel,
  });

  const strengthComparison: StrengthComparisonRow[] = strengthCmp;

  const goalThresholds: GoalThresholds = {
    calorieMin: user?.calorieGoalPct ?? 85,
    calorieMax: user?.calorieGoalUpperPct ?? 115,
    proteinMin: user?.proteinGoalPct ?? 85,
  };

  return {
    weightChart,
    caloriesChart,
    strengthChart,
    workoutsChart,
    personalRecords,
    hasWorkoutsData,
    stats: {
      firstWeight,
      latestWeight,
      weightChange,
      weightChangePct,
      totalWorkouts: workoutCount,
      avgWorkoutsPerWeek,
      targetCalories: tc,
    },
    hasWeightData,
    hasCaloriesData,
    hasStrengthData,
    unitLabel,
    progress,
    consistency,
    goalHit,
    goalThresholds,
    strengthComparison,
    strengthProgressionChart,
    topStrengthExercise,
    hasStrengthProgressionData,
    insights,
  };
}

// ── Threshold update ───────────────────────────────────────────────────────

export async function updateGoalThresholds(
  calorieMin: number,
  calorieMax: number,
  proteinMin: number,
): Promise<void> {
  const user = await getUser();
  if (!user) return;
  await updateUser(user.id, {
    calorieGoalPct: calorieMin,
    calorieGoalUpperPct: calorieMax,
    proteinGoalPct: proteinMin,
  });
}

// ── Goal Calendar ──────────────────────────────────────────────────────────

function calorieStatus(
  actual: number,
  target: number,
  minPct: number,   // e.g. 85
  maxPct: number,   // e.g. 115
): GoalStatus {
  if (actual === 0) return 'none';
  const pct = (actual / target) * 100;
  if (pct >= minPct && pct <= maxPct) return 'achieved';
  // partial = within 20pp below min OR within 20pp above max
  if (pct >= Math.max(50, minPct - 20) && pct <= maxPct + 20) return 'partial';
  return 'missed';
}

function proteinStatus(
  actual: number,
  target: number,
  minPct: number,   // e.g. 85
): GoalStatus {
  if (actual === 0) return 'none';
  const pct = (actual / target) * 100;
  if (pct >= minPct) return 'achieved';
  // partial = within 25pp below min
  if (pct >= Math.max(50, minPct - 25)) return 'partial';
  return 'missed';
}

export async function getGoalCalendarData(
  year: number,
  month: number  // 0-indexed
): Promise<GoalCalendarData> {
  const user = await getUser();
  const { targetCalories, targetProtein } = user
    ? computeTargets(user)
    : { targetCalories: 2000, targetProtein: 130 };

  const calMinPct  = user?.calorieGoalPct       ?? 85;
  const calMaxPct  = user?.calorieGoalUpperPct   ?? 115;
  const protMinPct = user?.proteinGoalPct        ?? 85;

  const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
  const todayStr  = isoDate(new Date());

  const [mealTotals, workoutDates] = await Promise.all([
    getDailyMealTotalsForMonth(yearMonth).catch(() => []),
    getCompletedWorkoutDatesForMonth(yearMonth).catch(() => []),
  ]);

  const mealMap = new Map(mealTotals.map(r => [r.date, r]));
  const workoutSet = new Set(workoutDates);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: DayGoalStatus[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${yearMonth}-${String(d).padStart(2, '0')}`;
    const isFuture = dateStr > todayStr;

    if (isFuture) {
      days.push({ date: d, calories: 'none', protein: 'none', workouts: 'none' });
      continue;
    }

    const meal = mealMap.get(dateStr);
    days.push({
      date: d,
      calories: calorieStatus(meal?.totalCalories ?? 0, targetCalories, calMinPct, calMaxPct),
      protein:  proteinStatus(meal?.totalProtein ?? 0, targetProtein, protMinPct),
      workouts: workoutSet.has(dateStr) ? 'achieved' : 'none',
    });
  }

  // Summary (only count days with at least some data)
  const pastDays = days.filter(d =>
    d.calories !== 'none' || d.protein !== 'none' || d.workouts !== 'none'
  );
  const achieved = pastDays.filter(d =>
    d.calories === 'achieved' && d.protein === 'achieved'
  ).length;
  const missed = pastDays.filter(d =>
    d.calories === 'missed' || d.protein === 'missed'
  ).length;
  const partial = pastDays.length - achieved - missed;
  const successRate = pastDays.length > 0
    ? Math.round((achieved / pastDays.length) * 100)
    : 0;

  return {
    year, month, days,
    targetCalories, targetProtein,
    summary: { achieved, partial, missed, successRate },
  };
}
