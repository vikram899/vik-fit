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
  maxWeight: number;
  achievedAt: string; // ISO datetime
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

export interface AnalyticsData {
  weightChart: ChartData;
  caloriesChart: ChartData;
  strengthChart: ChartData;
  personalRecords: PersonalRecord[];
  stats: AnalyticsStats;
  hasWeightData: boolean;
  hasCaloriesData: boolean;
  hasStrengthData: boolean;
  unitLabel: string; // 'kg' | 'lbs'
}
