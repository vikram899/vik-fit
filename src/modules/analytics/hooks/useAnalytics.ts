import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getAnalyticsData, updateGoalThresholds } from '../services/analyticsService';
import { AnalyticsData, Period } from '../types';

const EMPTY: AnalyticsData = {
  weightChart:   { labels: [], values: [] },
  caloriesChart: { labels: [], values: [] },
  strengthChart: { labels: [], values: [] },
  workoutsChart: { labels: [], values: [] },
  personalRecords: [],
  stats: {
    firstWeight: 0, latestWeight: 0,
    weightChange: 0, weightChangePct: 0,
    totalWorkouts: 0, avgWorkoutsPerWeek: 0,
    targetCalories: null,
  },
  hasWeightData: false,
  hasCaloriesData: false,
  hasStrengthData: false,
  hasWorkoutsData: false,
  unitLabel: 'kg',
  progress: {
    direction: 'maintaining',
    weightChange: 0,
    weeklyRate: 0,
    currentWeight: 0,
    targetWeight: null,
    weeksToGoal: null,
    goalLabel: 'maintain',
  },
  consistency: { score: 0, completed: 0, scheduled: 0 },
  goalHit: {
    calorieDaysHit: 0, calorieDaysTracked: 0,
    proteinDaysHit: 0, proteinDaysTracked: 0,
    targetCalories: 2000, targetProtein: 130,
  },
  goalThresholds: { calorieMin: 85, calorieMax: 115, proteinMin: 85 },
  strengthComparison: [],
  strengthProgressionChart: { labels: [], values: [] },
  topStrengthExercise: '',
  hasStrengthProgressionData: false,
  insights: [],
};

export function useAnalytics() {
  const [period, setPeriodState] = useState<Period>('week');
  const [data, setData] = useState<AnalyticsData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: Period, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await getAnalyticsData(p);
      setData(result);
    } catch (e) {
      console.warn('[useAnalytics] error:', e);
      if (!silent) setData(EMPTY);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(period);
    }, [load, period])
  );

  const setPeriod = useCallback((p: Period) => {
    setPeriodState(p);
  }, []);

  const refresh = useCallback(() => { load(period); }, [load, period]);

  const saveThresholds = useCallback(async (calMin: number, calMax: number, protMin: number) => {
    // Optimistic update so the card reflects new values immediately
    setData(prev => ({
      ...prev,
      goalThresholds: { calorieMin: calMin, calorieMax: calMax, proteinMin: protMin },
    }));
    await updateGoalThresholds(calMin, calMax, protMin);
    // Silent background reload to recompute goal-hit counts with new thresholds
    load(period, true);
  }, [load, period]);

  return { period, setPeriod, data, loading, refresh, saveThresholds };
}
