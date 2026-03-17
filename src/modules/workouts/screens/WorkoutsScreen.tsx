import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { Plus, Dumbbell, ChevronRight, Calendar, Play } from 'lucide-react-native';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { workoutsStyles } from '../styles';
import { WorkoutsStackParamList } from '@core/navigation/stacks/WorkoutsStack';
import { getLastPerformedLog } from '../services/workoutTemplateService';
import SelectWorkoutModal from '../components/SelectWorkoutModal';
import { Radius } from '@theme/radius';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'Workouts'>;

const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseMeta(description: string | null | undefined): { muscleGroups?: string[]; duration?: number } {
  if (!description) return {};
  try { return JSON.parse(description); } catch { return {}; }
}

function formatRelativeTime(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default function WorkoutsScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const { templates, loading, refresh } = useWorkoutTemplates();

  const [lastPerformedMap, setLastPerformedMap] = useState<Map<number, string | null>>(new Map());
  const [selectModalVisible, setSelectModalVisible] = useState(false);

  const today = new Date();
  const currentWeekday = today.getDay();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD UTC
  const todayLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const todaysWorkouts = useMemo(
    () => templates.filter((t) => {
      if (!t.assignedWeekdays.includes(currentWeekday)) return false;
      const lastIso = lastPerformedMap.get(t.id);
      if (lastIso && lastIso.startsWith(todayStr)) return false; // completed today
      return true;
    }),
    [templates, currentWeekday, lastPerformedMap, todayStr]
  );

  // Load last performed for all templates
  useEffect(() => {
    if (templates.length === 0) return;
    Promise.all(
      templates.map((t) =>
        getLastPerformedLog(t.id).then((log) => ({ id: t.id, date: log?.endedAt ?? null }))
      )
    ).then((results) => {
      const map = new Map<number, string | null>();
      results.forEach(({ id, date }) => map.set(id, date));
      setLastPerformedMap(map);
    });
  }, [templates]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      <ScrollView
        style={workoutsStyles.container}
        contentContainerStyle={workoutsStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
          paddingTop: spacing.xl, paddingBottom: spacing.base,
        }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary }}>Workouts</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{todayLabel}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setSelectModalVisible(true)}
            activeOpacity={1}
            style={{
              width: 48, height: 48, borderRadius: Radius.md,
              backgroundColor: '#3B82F6',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
            }}
          >
            <Plus size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: spacing['2xl'] }} />
        ) : (
          <>
            {/* ── Today's Schedule ── */}
            {todaysWorkouts.length > 0 && (
              <View style={{ marginBottom: spacing.base }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Calendar size={18} color="#84CC16" />
                  <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>
                    Today's Schedule
                  </Text>
                </View>
                {todaysWorkouts.map((t) => (
                  <View
                    key={t.id}
                    style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderRadius: Radius.lg,
                      padding: spacing.base,
                      marginBottom: spacing.sm,
                      borderWidth: 1, borderColor: colors.border,
                      overflow: 'hidden',
                    }}
                  >
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(132,204,22,0.08)' }} />
                    <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
                      {t.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <Dumbbell size={14} color="rgba(255,255,255,0.6)" />
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                        {t.exerciseCount} exercises
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('WorkoutDetail', { workoutTemplateId: t.id })}
                      activeOpacity={1}
                      style={{
                        backgroundColor: '#84CC16', borderRadius: Radius.md,
                        paddingVertical: 12,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                        shadowColor: '#84CC16', shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
                      }}
                    >
                      <Play size={18} color="#fff" fill="#fff" />
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>View & Start</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* ── All Workouts ── */}
            {templates.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
                <View style={{
                  width: 80, height: 80, borderRadius: 40,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  <Dumbbell size={32} color="rgba(255,255,255,0.3)" />
                </View>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>No workouts yet</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 20 }}>
                  Create your first workout to get started
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateWorkout', undefined)}
                  activeOpacity={1}
                  style={{
                    backgroundColor: '#3B82F6', borderRadius: Radius.md,
                    paddingHorizontal: 24, paddingVertical: 12,
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
                  }}
                >
                  <Plus size={18} color="#fff" />
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Create Workout</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>
                  All Workouts
                </Text>
                {templates.map((t) => {
                  const lastIso = lastPerformedMap.get(t.id);
                  const lastLabel = lastIso ? `Last: ${formatRelativeTime(lastIso)}` : null;
                  const meta = parseMeta(t.description);
                  const muscleGroups: string[] = meta.muscleGroups ?? [];
                  const duration = meta.duration ?? Math.max(t.exerciseCount * 5, 10);

                  return (
                    <TouchableOpacity
                      key={t.id}
                      activeOpacity={1}
                      onPress={() => navigation.navigate('WorkoutDetail', { workoutTemplateId: t.id })}
                    >
                      <View style={{
                        backgroundColor: colors.backgroundSecondary,
                        borderRadius: Radius.lg,
                        padding: spacing.base,
                        marginBottom: spacing.sm,
                        borderWidth: 1, borderColor: colors.border,
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                      }}>
                        {/* Icon box */}
                        <View style={{
                          width: 48, height: 48, borderRadius: Radius.md,
                          backgroundColor: 'rgba(59,130,246,0.15)',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Dumbbell size={22} color="#3B82F6" />
                        </View>

                        {/* Content */}
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{t.name}</Text>
                            <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
                          </View>

                          {/* Muscle chips */}
                          {muscleGroups.length > 0 && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 5 }}>
                              {muscleGroups.map((g) => (
                                <View key={g} style={{
                                  backgroundColor: 'rgba(59,130,246,0.12)',
                                  borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
                                  borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
                                }}>
                                  <Text style={{ fontSize: 11, color: '#3B82F6' }}>{g}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Day chips */}
                          {t.assignedWeekdays.length > 0 && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
                              {t.assignedWeekdays.map((d) => (
                                <View key={d} style={{
                                  backgroundColor: 'rgba(132,204,22,0.15)',
                                  borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
                                  borderWidth: 1, borderColor: 'rgba(132,204,22,0.3)',
                                }}>
                                  <Text style={{ fontSize: 11, color: '#84CC16' }}>{WEEKDAY_FULL[d]}</Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Stats row */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                              {t.exerciseCount} {t.exerciseCount === 1 ? 'exercise' : 'exercises'}
                              {' · '}
                              {duration} min
                            </Text>
                            {lastLabel ? (
                              <Text style={{ fontSize: 12, color: '#84CC16' }}>{lastLabel}</Text>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <SelectWorkoutModal
        visible={selectModalVisible}
        onClose={() => setSelectModalVisible(false)}
        onViewWorkout={(id) => navigation.navigate('WorkoutDetail', { workoutTemplateId: id })}
        onStartWorkout={(id) => navigation.navigate('ExecuteWorkout', { workoutTemplateId: id })}
        onCreateNew={(id) => navigation.navigate('WorkoutDetail', { workoutTemplateId: id })}
      />
    </SafeAreaView>
  );
}
