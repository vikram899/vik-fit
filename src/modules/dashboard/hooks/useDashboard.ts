import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboardData } from '../services/dashboardService';
import { DashboardData } from '../types';
import { skipWorkoutForDate } from '@database/repositories/workoutRepo';
import { logWeight } from '@database/repositories/weightRepo';
import { getUser, updateUser } from '@database/repositories/userRepo';
import { todayDateString } from '@shared/utils/dateUtils';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardData();
      setData(result);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const skipWorkout = useCallback(
    async (workoutTemplateId: number) => {
      await skipWorkoutForDate(workoutTemplateId, todayDateString());
      await refresh();
    },
    [refresh]
  );

  const logWeightEntry = useCallback(
    async (weight: number, note?: string) => {
      const now = new Date().toISOString();
      await logWeight({ weight, note: note ?? null, loggedAt: now, createdAt: now });
      await refresh();
    },
    [refresh]
  );

  const setTargetWeight = useCallback(
    async (targetWeight: number) => {
      const user = await getUser();
      if (!user) return;
      await updateUser(user.id, { targetWeight });
      await refresh();
    },
    [refresh]
  );

  return { data, loading, error, refresh, skipWorkout, logWeightEntry, setTargetWeight };
}
