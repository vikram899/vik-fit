import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  getExercisesInPeriod,
  getExerciseSessionPoints,
  ExerciseChipData,
  ExerciseSessionPoint,
} from '@database/repositories/analyticsRepo';
import { getUser } from '@database/repositories/userRepo';

const DAYS = 30;

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface ExerciseTrendData {
  exerciseTemplateId: number;
  exerciseName: string;
  exerciseType: string;
  trend: TrendDirection;
  trendPct: number;        // signed %; positive = improving
  sessions: ExerciseSessionPoint[];
  unit: string;            // 'kg' | 'lbs' | 'reps' | 'min'
  metricLabel: string;     // 'Estimated 1RM' | 'Max Reps' | 'Duration'
}

export interface OverallStrengthTrend {
  trend: TrendDirection;
  trendPct: number;        // average across all exercises
  exerciseCount: number;
}

function getExerciseValue(point: ExerciseSessionPoint, type: string): number {
  if (type === 'strength') return point.estimated1RM > 0 ? point.estimated1RM : point.maxWeight;
  if (type === 'bodyweight') return point.maxReps;
  return point.maxDuration / 60; // minutes
}

function computeTrend(values: number[]): { trend: TrendDirection; trendPct: number } {
  if (values.length < 2) return { trend: 'stable', trendPct: 0 };
  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);
  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const first = avg(firstHalf);
  const second = avg(secondHalf);
  if (first === 0) return { trend: 'stable', trendPct: 0 };
  const pct = ((second - first) / first) * 100;
  const trend: TrendDirection = pct > 3 ? 'improving' : pct < -3 ? 'declining' : 'stable';
  return { trend, trendPct: Math.round(pct) };
}

function buildMetaForType(type: string, unitLabel: string): { unit: string; metricLabel: string } {
  if (type === 'strength') return { unit: unitLabel, metricLabel: 'Estimated 1RM' };
  if (type === 'bodyweight') return { unit: 'reps', metricLabel: 'Max Reps' };
  return { unit: 'min', metricLabel: 'Duration' };
}

export function useStrength() {
  const [unitLabel, setUnitLabel] = useState<'kg' | 'lbs'>('kg');
  const [exercises, setExercises] = useState<ExerciseTrendData[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [overallTrend, setOverallTrend] = useState<OverallStrengthTrend>({ trend: 'stable', trendPct: 0, exerciseCount: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [user, chips] = await Promise.all([
        getUser(),
        getExercisesInPeriod(daysAgo(DAYS)),
      ]);
      const label: 'kg' | 'lbs' = user?.unitPreference === 'imperial' ? 'lbs' : 'kg';
      setUnitLabel(label);

      const TRACKABLE = ['strength', 'bodyweight', 'hiit', 'cardio', 'endurance'];
      const trackable = chips.filter(c => TRACKABLE.includes(c.exerciseType));

      const sessionResults = await Promise.all(
        trackable.map(c => getExerciseSessionPoints(c.exerciseTemplateId, daysAgo(DAYS)))
      );

      const trendData: ExerciseTrendData[] = trackable.map((chip, i) => {
        const sessions = sessionResults[i];
        const values = sessions.map(s => getExerciseValue(s, chip.exerciseType));
        const { trend, trendPct } = computeTrend(values);
        const { unit, metricLabel } = buildMetaForType(chip.exerciseType, label);
        return { ...chip, trend, trendPct, sessions, unit, metricLabel };
      }).filter(d => d.sessions.length > 0);

      setExercises(trendData);

      // Overall trend = average trendPct across exercises with >=2 sessions
      const withTrend = trendData.filter(d => d.sessions.length >= 2);
      if (withTrend.length > 0) {
        const avg = withTrend.reduce((s, d) => s + d.trendPct, 0) / withTrend.length;
        const overall: TrendDirection = avg > 3 ? 'improving' : avg < -3 ? 'declining' : 'stable';
        setOverallTrend({ trend: overall, trendPct: Math.round(avg), exerciseCount: trendData.length });
      } else {
        setOverallTrend({ trend: 'stable', trendPct: 0, exerciseCount: trendData.length });
      }

      // Default: select first exercise
      if (trendData.length > 0) setSelectedId(trendData[0].exerciseTemplateId);
    } catch (e) {
      console.warn('[useStrength]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const selectedExercise = exercises.find(e => e.exerciseTemplateId === selectedId) ?? null;

  return { exercises, selectedId, setSelectedId, selectedExercise, overallTrend, unitLabel, loading };
}
