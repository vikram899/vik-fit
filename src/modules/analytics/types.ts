export type Period = 'week' | 'month' | 'year';

// ── Goal Calendar ─────────────────────────────────────────────────────────

export type GoalStatus = 'achieved' | 'partial' | 'missed' | 'none';
export type GoalFilter = 'all' | 'calories' | 'protein' | 'workouts';

export interface DayGoalStatus {
  date: number;           // day of month (1–31)
  calories: GoalStatus;
  protein: GoalStatus;
  workouts: GoalStatus;
}

export interface GoalCalendarData {
  year: number;
  month: number;          // 0-indexed (0 = Jan)
  days: DayGoalStatus[];
  targetCalories: number;
  targetProtein: number;
  summary: {
    achieved: number;
    partial: number;
    missed: number;
    successRate: number;  // 0–100
  };
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export interface PersonalRecord {
  exerciseName: string;
  exerciseType: string;
  bestValue: number;    // weight, reps, or seconds depending on type
  metricLabel: string;  // 'kg', 'lbs', 'reps', 'sec'
  achievedAt: string;   // ISO datetime
}

export interface AnalyticsStats {
  firstWeight: number;
  latestWeight: number;
  weightChange: number;      // positive = gained, negative = lost
  weightChangePct: number;
  totalWorkouts: number;
  avgWorkoutsPerWeek: number;
  targetCalories: number | null;
}

export interface StrengthComparisonRow {
  exerciseName: string;
  exerciseType: string;
  currentMax: number;
  previousMax: number | null;
}

export interface GoalThresholds {
  calorieMin: number;   // calorieGoalPct (e.g. 85)
  calorieMax: number;   // calorieGoalUpperPct (e.g. 115)
  proteinMin: number;   // proteinGoalPct (e.g. 85)
}

export interface AnalyticsData {
  weightChart: ChartData;
  caloriesChart: ChartData;
  strengthChart: ChartData;
  workoutsChart: ChartData;
  personalRecords: PersonalRecord[];
  stats: AnalyticsStats;
  hasWeightData: boolean;
  hasCaloriesData: boolean;
  hasStrengthData: boolean;
  hasWorkoutsData: boolean;
  unitLabel: string; // 'kg' | 'lbs'
  progress: ProgressSummary;
  consistency: ConsistencyData;
  goalHit: GoalHitData;
  goalThresholds: GoalThresholds;
  strengthComparison: StrengthComparisonRow[];
  strengthProgressionChart: ChartData;
  topStrengthExercise: string;
  hasStrengthProgressionData: boolean;
  insights: Insight[];
}

// ── Analytics summary types ─────────────────────────────────────────────────

export interface ProgressSummary {
  direction: 'losing' | 'gaining' | 'maintaining';
  weightChange: number;         // signed, in user's unit
  weeklyRate: number;           // kg or lbs per week
  currentWeight: number;
  targetWeight: number | null;
  weeksToGoal: number | null;
  goalLabel: 'lose_weight' | 'maintain' | 'gain_muscle';
}

export interface ConsistencyData {
  score: number;        // 0–100
  completed: number;
  scheduled: number;
}

export interface GoalHitData {
  calorieDaysHit: number;
  calorieDaysTracked: number;
  proteinDaysHit: number;
  proteinDaysTracked: number;
  targetCalories: number;
  targetProtein: number;
}

export type InsightType = 'success' | 'warning' | 'info';

export interface Insight {
  type: InsightType;
  title: string;
  body: string;
}
