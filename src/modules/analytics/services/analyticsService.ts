import { getUser } from '@database/repositories/userRepo';
import {
  getWeightLogsForPeriod,
  getDailyCaloriesForPeriod,
  getTopExerciseMaxWeights,
  getPersonalRecords as getPersonalRecordsFromRepo,
  getCompletedWorkoutCount,
  getDailyMealTotalsForMonth,
  getCompletedWorkoutDatesForMonth,
  WeightLogPoint,
  DailyCaloriesPoint,
} from '@database/repositories/analyticsRepo';
import {
  Period, ChartData, AnalyticsData, PersonalRecord,
  GoalCalendarData, DayGoalStatus, GoalStatus,
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

// ── Main service ───────────────────────────────────────────────────────────

export async function getAnalyticsData(period: Period): Promise<AnalyticsData> {
  const user = await getUser();
  const imperial = user?.unitPreference === 'imperial';
  const unitLabel = imperial ? 'lbs' : 'kg';
  const fallbackWeight = user?.weight ?? 0;

  // Compute fromDate based on period
  const fromDate = period === 'week'
    ? daysAgo(6)
    : period === 'month'
      ? daysAgo(29)
      : daysAgo(364);

  // Parallel DB fetches — each wrapped so one failure doesn't abort the rest
  const safe = <T>(p: Promise<T>, fallback: T): Promise<T> =>
    p.catch((e) => { console.warn('[analytics]', e); return fallback; });

  const [weightLogs, calorieLogs, strengthRows, prRows, workoutCount] = await Promise.all([
    safe(getWeightLogsForPeriod(fromDate), []),
    safe(getDailyCaloriesForPeriod(fromDate), []),
    safe(getTopExerciseMaxWeights(fromDate, 5), []),
    safe(getPersonalRecordsFromRepo(5), []),
    safe(getCompletedWorkoutCount(fromDate), 0),
  ]);

  // ── Weight chart ──
  let weightChart: ChartData;
  const hasWeightData = weightLogs.length > 0;
  if (period === 'week') {
    weightChart = buildWeightChartWeek(weightLogs, fallbackWeight);
  } else if (period === 'month') {
    weightChart = buildWeightChartMonth(weightLogs, fallbackWeight);
  } else {
    weightChart = buildWeightChartYear(weightLogs, fallbackWeight);
  }

  // ── Calorie chart ──
  let caloriesChart: ChartData;
  const hasCaloriesData = calorieLogs.some(r => r.totalCalories > 0);
  if (period === 'week') {
    caloriesChart = buildCaloriesChartWeek(calorieLogs);
  } else if (period === 'month') {
    caloriesChart = buildCaloriesChartMonth(calorieLogs);
  } else {
    caloriesChart = buildCaloriesChartYear(calorieLogs);
  }

  // ── Strength chart ──
  const hasStrengthData = strengthRows.length > 0;
  const strengthChart = buildStrengthChart(strengthRows);

  // ── Personal records ──
  const personalRecords: PersonalRecord[] = prRows.map(r => ({
    exerciseName: r.exerciseName,
    maxWeight: r.maxWeight,
    achievedAt: r.achievedAt,
  }));

  // ── Stats ──
  const firstWeight = weightLogs.length > 0 ? weightLogs[0].weight : fallbackWeight;
  const latestWeight = weightLogs.length > 0
    ? weightLogs[weightLogs.length - 1].weight
    : fallbackWeight;
  const weightChange = latestWeight - firstWeight;
  const weightChangePct = firstWeight > 0 ? (weightChange / firstWeight) * 100 : 0;
  const avgWorkoutsPerWeek = workoutCount / weeksInPeriod(period);

  // Compute target calories from user (TDEE approximation already stored in dashboard service)
  // Since users table has no targetCalories column, we pass null here
  const targetCalories: number | null = null;

  return {
    weightChart,
    caloriesChart,
    strengthChart,
    personalRecords,
    stats: {
      firstWeight,
      latestWeight,
      weightChange,
      weightChangePct,
      totalWorkouts: workoutCount,
      avgWorkoutsPerWeek,
      targetCalories,
    },
    hasWeightData,
    hasCaloriesData,
    hasStrengthData,
    unitLabel,
  };
}

// ── Goal Calendar ──────────────────────────────────────────────────────────

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
    targetCalories: Math.round(tdee + adj),
    targetProtein:  Math.round(weight * 1.6),
  };
}

function calorieStatus(actual: number, target: number): GoalStatus {
  if (actual === 0) return 'none';
  const pct = actual / target;
  if (pct >= 0.9 && pct <= 1.15) return 'achieved';
  if (pct >= 0.7) return 'partial';
  return 'missed';
}

function proteinStatus(actual: number, target: number): GoalStatus {
  if (actual === 0) return 'none';
  const pct = actual / target;
  if (pct >= 0.85) return 'achieved';
  if (pct >= 0.6)  return 'partial';
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
      calories: calorieStatus(meal?.totalCalories ?? 0, targetCalories),
      protein:  proteinStatus(meal?.totalProtein ?? 0, targetProtein),
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
