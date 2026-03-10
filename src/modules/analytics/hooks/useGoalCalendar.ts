import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getGoalCalendarData } from '../services/analyticsService';
import { GoalCalendarData, GoalFilter } from '../types';

function emptyCalendarData(year: number, month: number): GoalCalendarData {
  return {
    year, month, days: [],
    targetCalories: 2000, targetProtein: 130,
    summary: { achieved: 0, partial: 0, missed: 0, successRate: 0 },
  };
}

export function useGoalCalendar() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [weekStart, setWeekStart] = useState<number>(() => {
    // Start on the Monday of the current week
    const d = new Date();
    const dayOfWeek = d.getDay(); // 0=Sun
    return Math.max(1, d.getDate() - ((dayOfWeek + 6) % 7));
  });

  const [data, setData]       = useState<GoalCalendarData>(() => emptyCalendarData(now.getFullYear(), now.getMonth()));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const result = await getGoalCalendarData(y, m);
      setData(result);
    } catch (e) {
      console.warn('[useGoalCalendar]', e);
      setData(emptyCalendarData(y, m));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { load(year, month); }, [load, year, month])
  );

  const goToPrevMonth = useCallback(() => {
    setSelectedDate(null);
    setMonth(m => {
      if (m === 0) { setYear(y => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setSelectedDate(null);
    setMonth(m => {
      if (m === 11) { setYear(y => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goToPrevWeek = useCallback(() => {
    setWeekStart(w => Math.max(1, w - 7));
    setSelectedDate(null);
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStart(w => {
      const next = w + 7;
      return next <= daysInMonth ? next : w;
    });
    setSelectedDate(null);
  }, [daysInMonth]);

  return {
    year, month, data, loading,
    goalFilter, setGoalFilter,
    selectedDate, setSelectedDate,
    viewMode, setViewMode,
    weekStart,
    goToPrevMonth, goToNextMonth,
    goToPrevWeek, goToNextWeek,
    daysInMonth,
  };
}
