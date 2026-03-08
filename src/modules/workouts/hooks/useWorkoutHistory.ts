import { useState, useEffect, useCallback } from 'react';
import { WorkoutLogRow } from '@database/repositories/workoutRepo';
import { getRecentWorkouts } from '../services/workoutLogService';

export function useWorkoutHistory(limit: number = 10) {
  const [logs, setLogs] = useState<WorkoutLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRecentWorkouts(limit);
      setLogs(result);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { logs, loading, refresh };
}
