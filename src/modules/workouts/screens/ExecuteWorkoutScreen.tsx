import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { WorkoutsStackParamList } from '@core/navigation/stacks/WorkoutsStack';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import SetRow from '../components/SetRow';
import { Layout } from '@theme/spacing';
import { Radius } from '@theme/radius';
import { Save, Timer, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'ExecuteWorkout'>;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ExecuteWorkoutScreen({ navigation, route }: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { workoutTemplateId } = route.params;
  const { state, loading, restTimer, startWorkout, updateSet, addSet, removeSet, startRestTimer, skipRestTimer, finishWorkout } =
    useActiveWorkout();

  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startWorkout(workoutTemplateId);
  }, [workoutTemplateId]);

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleFinish = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const logId = await finishWorkout();
    if (logId) navigation.replace('WorkoutSummary', { workoutLogId: logId });
  };

  if (loading || !state) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>Loading workout...</Text>
      </SafeAreaView>
    );
  }

  const totalSets = state.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = state.exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.completed).length, 0);
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      {/* Header */}
      <View style={{
        paddingHorizontal: Layout.screenPaddingHorizontal,
        paddingTop: spacing.base,
        paddingBottom: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
            {state.name}
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Keep pushing! 💪</Text>
        </View>
        <TouchableOpacity onPress={handleFinish} activeOpacity={0.7} style={{ paddingVertical: 6 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#3B82F6' }}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Card */}
      <View style={{
        marginHorizontal: Layout.screenPaddingHorizontal,
        marginBottom: spacing.base,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: Radius.lg,
        padding: spacing.base,
        borderWidth: 1, borderColor: colors.border,
        overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(59,130,246,0.08)' }} />

        {/* Timer / rest in top-right */}
        <View style={{ position: 'absolute', top: spacing.base, right: spacing.base, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {restTimer !== null ? (
            <>
              <Timer size={14} color="#3B82F6" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#3B82F6' }}>{restTimer}s</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Rest</Text>
              <TouchableOpacity onPress={skipRestTimer} style={{ marginLeft: 4 }}>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textDecorationLine: 'underline' }}>skip</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Timer size={14} color="rgba(255,255,255,0.4)" />
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{formatElapsed(elapsed)}</Text>
            </>
          )}
        </View>

        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Workout Progress</Text>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 12 }}>
          {completedSets}
          <Text style={{ fontSize: 16, fontWeight: '400', color: 'rgba(255,255,255,0.4)' }}>/{totalSets} Sets</Text>
        </Text>

        <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#3B82F6', '#84CC16']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 8, borderRadius: 4, width: `${Math.round(progress * 100)}%` as any }}
          />
        </View>
      </View>

      {/* Exercise list */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPaddingHorizontal,
          paddingBottom: 96 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {state.exercises.map((exercise, exIdx) => {
          const completedInEx = exercise.sets.filter((s) => s.completed).length;
          return (
            <View
              key={exercise.exerciseLogId}
              style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: Radius.lg,
                borderWidth: 1, borderColor: colors.border,
                marginBottom: spacing.sm,
                overflow: 'hidden',
              }}
            >
              {/* Exercise header */}
              <View style={{ padding: spacing.base, paddingBottom: spacing.sm }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 }}>
                  {exercise.name}
                </Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  {completedInEx}/{exercise.sets.length} sets completed
                </Text>
              </View>

              {/* Sets */}
              <View style={{ paddingHorizontal: spacing.sm }}>
                {exercise.sets.map((set, setIdx) => (
                  <SetRow
                    key={set.setNumber}
                    set={set}
                    exerciseType={exercise.type}
                    onUpdate={(fields) => updateSet(exIdx, setIdx, fields)}
                    onComplete={() => {
                      updateSet(exIdx, setIdx, { completed: !set.completed });
                      if (!set.completed) startRestTimer(exercise.defaultRestTimeSeconds);
                    }}
                    onDelete={exercise.sets.length > 1 ? () => removeSet(exIdx, setIdx) : undefined}
                  />
                ))}
              </View>

              {/* Add Set */}
              <TouchableOpacity
                onPress={() => addSet(exIdx)}
                activeOpacity={0.7}
                style={{
                  marginHorizontal: spacing.sm,
                  marginBottom: spacing.sm,
                  paddingVertical: 10,
                  borderRadius: Radius.md,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderStyle: 'dashed',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Plus size={14} color="rgba(255,255,255,0.4)" />
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Add Set</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Sticky Finish button */}
      <View style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        paddingHorizontal: Layout.screenPaddingHorizontal,
        paddingBottom: insets.bottom + spacing.base,
        paddingTop: spacing.sm,
        backgroundColor: colors.backgroundPrimary,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        <TouchableOpacity
          onPress={handleFinish}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#84CC16',
            borderRadius: Radius.xl,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            shadowColor: '#84CC16',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Save size={18} color="#fff" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Finish & Save Workout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
