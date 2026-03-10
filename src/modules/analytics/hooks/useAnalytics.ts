import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getAnalyticsData } from '../services/analyticsService';
import { AnalyticsData, Period } from '../types';

const EMPTY: AnalyticsData = {
  weightChart:   { labels: [], values: [] },
  caloriesChart: { labels: [], values: [] },
  strengthChart: { labels: [], values: [] },
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
  unitLabel: 'kg',
};

export function useAnalytics() {
  const [period, setPeriodState] = useState<Period>('week');
  const [data, setData] = useState<AnalyticsData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const result = await getAnalyticsData(p);
      setData(result);
    } catch (e) {
      console.warn('[useAnalytics] error:', e);
      setData(EMPTY);
    } finally {
      setLoading(false);
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

  return { period, setPeriod, data, loading };
}
