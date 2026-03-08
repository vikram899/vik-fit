import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { ArrowLeft, Edit2, Trash2, Play, GripVertical, X, Plus } from 'lucide-react-native';
import { WorkoutsStackParamList } from '@core/navigation/stacks/WorkoutsStack';
import {
  getTemplateById,
  getTemplateExercisesWithNames,
  getLastPerformedLog,
  deleteTemplate,
  updateTemplate,
  removeExercise,
} from '../services/workoutTemplateService';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'WorkoutDetail'>;
type ExerciseRow = Awaited<ReturnType<typeof getTemplateExercisesWithNames>>[number];
type TemplateRow = Awaited<ReturnType<typeof getTemplateById>>;

const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAYS_DISPLAY = [
  { label: 'Mon', index: 1 },
  { label: 'Tue', index: 2 },
  { label: 'Wed', index: 3 },
  { label: 'Thu', index: 4 },
  { label: 'Fri', index: 5 },
  { label: 'Sat', index: 6 },
  { label: 'Sun', index: 0 },
];

function formatRelativeTime(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default function WorkoutDetailScreen({ navigation, route }: Props) {
  const { workoutTemplateId } = route.params;
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const [template, setTemplate] = useState<TemplateRow | null>(null);
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [lastPerformed, setLastPerformed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [assignedWeekday, setAssignedWeekday] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tmpl, exs, lastLog] = await Promise.all([
        getTemplateById(workoutTemplateId),
        getTemplateExercisesWithNames(workoutTemplateId),
        getLastPerformedLog(workoutTemplateId),
      ]);
      setTemplate(tmpl ?? null);
      setAssignedWeekday(tmpl?.assignedWeekday ?? null);
      setExercises(exs);
      setLastPerformed(lastLog?.endedAt ?? null);
    } finally {
      setLoading(false);
    }
  }, [workoutTemplateId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalSets = exercises.reduce((acc, ex) => acc + ex.defaultSets, 0);
  const estimatedDuration = Math.max(Math.round(totalSets * 2), 5);
  const dayName = assignedWeekday != null ? WEEKDAY_FULL[assignedWeekday] : null;

  const handleToggleDay = async (dayIndex: number) => {
    const newWeekday = assignedWeekday === dayIndex ? null : dayIndex;
    setAssignedWeekday(newWeekday);
    await updateTemplate(workoutTemplateId, { assignedWeekday: newWeekday });
  };

  const handleRemoveExercise = async (exerciseId: number) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    await removeExercise(exerciseId);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    await deleteTemplate(workoutTemplateId);
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brandPrimary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      {/* ── Sticky Header ── */}
      <View style={{
        backgroundColor: colors.backgroundPrimary,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: Layout.screenPaddingHorizontal,
        paddingTop: spacing.base,
        paddingBottom: spacing.base,
      }}>
        {/* Back + Edit + Delete */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
            style={{
              width: 40, height: 40, borderRadius: Radius.md,
              backgroundColor: 'rgba(255,255,255,0.05)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setIsEditing((v) => !v)}
              activeOpacity={0.8}
              style={{
                width: 40, height: 40, borderRadius: Radius.md,
                backgroundColor: isEditing ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Edit2 size={18} color={isEditing ? '#fff' : 'rgba(255,255,255,0.7)'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteConfirm(true)}
              activeOpacity={0.75}
              style={{
                width: 40, height: 40, borderRadius: Radius.md,
                backgroundColor: 'rgba(255,255,255,0.05)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Workout name */}
        <Text style={{ fontSize: 24, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
          {template?.name}
        </Text>

        {/* Day tag */}
        {dayName ? (
          <View style={{ flexDirection: 'row' }}>
            <View style={{
              backgroundColor: 'rgba(132,204,22,0.2)',
              borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
              borderWidth: 1, borderColor: 'rgba(132,204,22,0.3)',
            }}>
              <Text style={{ fontSize: 12, color: '#84CC16' }}>{dayName}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPaddingHorizontal,
          paddingTop: spacing.base,
          paddingBottom: insets.bottom + 32,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stats Card ── */}
        <View style={{
          backgroundColor: colors.backgroundSecondary,
          borderRadius: Radius.lg,
          borderWidth: 1, borderColor: colors.border,
          overflow: 'hidden',
        }}>
          <View style={{ flexDirection: 'row', paddingVertical: 20 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>
                {exercises.length}
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Exercises</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>
                {totalSets}
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Total Sets</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>
                  {estimatedDuration}
                </Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 3, marginLeft: 2 }}>min</Text>
              </View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Duration</Text>
            </View>
          </View>

          {lastPerformed ? (
            <View style={{
              borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
              paddingVertical: 12, alignItems: 'center',
            }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                Last completed:{' '}
                <Text style={{ color: '#84CC16' }}>{formatRelativeTime(lastPerformed)}</Text>
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Start Workout Button ── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ExecuteWorkout', { workoutTemplateId })}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#84CC16',
            borderRadius: Radius.xl,
            paddingVertical: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            shadowColor: '#84CC16',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
          }}
        >
          <Play size={20} color="#fff" fill="#fff" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>Start Workout</Text>
        </TouchableOpacity>

        {/* ── Assigned Days (edit mode) ── */}
        {isEditing ? (
          <View style={{
            backgroundColor: colors.backgroundSecondary,
            borderRadius: Radius.lg,
            borderWidth: 1, borderColor: colors.border,
            padding: spacing.base,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>
              Assigned Days
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {DAYS_DISPLAY.map((day) => {
                const selected = assignedWeekday === day.index;
                return (
                  <TouchableOpacity
                    key={day.index}
                    onPress={() => handleToggleDay(day.index)}
                    activeOpacity={0.75}
                    style={{
                      width: '47%',
                      paddingVertical: 14,
                      borderRadius: Radius.md,
                      alignItems: 'center',
                      backgroundColor: selected ? 'rgba(132,204,22,0.2)' : 'rgba(255,255,255,0.05)',
                      borderWidth: 2,
                      borderColor: selected ? 'rgba(132,204,22,0.5)' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text style={{
                      fontSize: 14, fontWeight: '500',
                      color: selected ? '#84CC16' : 'rgba(255,255,255,0.6)',
                    }}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
              {assignedWeekday != null
                ? `Assigned to 1 day`
                : 'No days assigned'}
            </Text>
          </View>
        ) : null}

        {/* ── Exercises List ── */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>
              Exercises
            </Text>
            {isEditing ? (
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Tap to remove</Text>
            ) : null}
          </View>

          {exercises.length === 0 ? (
            <View style={{
              backgroundColor: colors.backgroundSecondary,
              borderRadius: Radius.lg, borderWidth: 1, borderColor: colors.border,
              padding: 24, alignItems: 'center',
            }}>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>No exercises added yet</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {exercises.map((ex, i) => (
                <View
                  key={ex.id}
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius: Radius.lg,
                    borderWidth: 1,
                    borderColor: isEditing ? 'rgba(239,68,68,0.3)' : colors.border,
                    padding: spacing.base,
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                  }}
                >
                  {/* Grip handle (edit mode) */}
                  {isEditing ? (
                    <GripVertical size={20} color="rgba(255,255,255,0.3)" />
                  ) : null}

                  {/* Number badge */}
                  <View style={{
                    width: 32, height: 32, borderRadius: 99,
                    backgroundColor: 'rgba(59,130,246,0.2)',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#3B82F6' }}>{i + 1}</Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 }}>
                      {ex.exerciseName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                        {ex.defaultSets} sets × {ex.defaultReps} reps
                      </Text>
                      {ex.defaultWeight > 0 ? (
                        <>
                          <View style={{ width: 4, height: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                            {ex.defaultWeight} lbs
                          </Text>
                        </>
                      ) : null}
                    </View>
                  </View>

                  {/* Remove button (edit mode) */}
                  {isEditing ? (
                    <TouchableOpacity
                      onPress={() => handleRemoveExercise(ex.id)}
                      activeOpacity={0.75}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        backgroundColor: 'rgba(239,68,68,0.2)',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <X size={16} color="#EF4444" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Add Exercise (edit mode) ── */}
        {isEditing ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateWorkout', { workoutTemplateId })}
            activeOpacity={0.75}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: Radius.xl,
              paddingVertical: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Plus size={20} color="#fff" />
            <Text style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>Add Exercise</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/* ── Delete Confirmation Modal ── */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade" statusBarTranslucent>
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
          alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
          <View style={{
            width: '100%', maxWidth: 360,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: Radius.xl, padding: 24,
            borderWidth: 1, borderColor: colors.border,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: 'rgba(239,68,68,0.2)',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Trash2 size={28} color="#EF4444" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
                Delete Workout?
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                This will permanently delete "{template?.name}" and all its exercises. This action cannot be undone.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(false)}
                activeOpacity={0.75}
                style={{
                  flex: 1, paddingVertical: 13, borderRadius: Radius.md,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                activeOpacity={0.8}
                style={{
                  flex: 1, paddingVertical: 13, borderRadius: Radius.md,
                  backgroundColor: '#EF4444',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
