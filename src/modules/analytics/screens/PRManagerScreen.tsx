import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';
import { ChevronLeft, ChevronRight, Plus, Trash2, Dumbbell } from 'lucide-react-native';
import { usePRManager } from '../hooks/usePRManager';
import { WorkoutTemplateWithCountRow } from '@database/repositories/workoutRepo';

type Step = 'list' | 'pickWorkout' | 'pickExercise';

export default function PRManagerScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const { tracked, workouts, exercises, loading, loadingExercises, trackedIds, loadExercisesForWorkout, addExercise, removeExercise } = usePRManager();
  const [step, setStep] = useState<Step>('list');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutTemplateWithCountRow | null>(null);

  const handleBack = () => {
    if (step === 'pickExercise') { setStep('pickWorkout'); return; }
    if (step === 'pickWorkout') { setStep('list'); return; }
    navigation.goBack();
  };

  const handleSelectWorkout = (workout: WorkoutTemplateWithCountRow) => {
    setSelectedWorkout(workout);
    loadExercisesForWorkout(workout.id);
    setStep('pickExercise');
  };

  const handleSelectExercise = async (exerciseTemplateId: number) => {
    await addExercise(exerciseTemplateId);
    setStep('list');
  };

  const cardStyle = {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  };

  const title = step === 'list' ? 'PR Exercises' : step === 'pickWorkout' ? 'Select Workout' : selectedWorkout?.name ?? 'Select Exercise';
  const subtitle = step === 'list' ? 'Exercises tracked for Personal Records' : step === 'pickWorkout' ? 'Choose a workout to browse exercises' : 'Tap an exercise to add it';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: Layout.screenPaddingHorizontal,
        paddingTop: spacing.base, paddingBottom: spacing.sm,
      }}>
        <TouchableOpacity onPress={handleBack} activeOpacity={1} style={{ padding: 4 }}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{subtitle}</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#3B82F6" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: Layout.screenPaddingHorizontal, paddingBottom: 40, paddingTop: spacing.sm }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── LIST: tracked exercises ── */}
          {step === 'list' && (
            <>
              {tracked.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 48, gap: 8 }}>
                  <Dumbbell size={36} color="rgba(255,255,255,0.15)" />
                  <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
                    No exercises tracked yet
                  </Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                    Tap "Add Exercise" to start tracking your PRs
                  </Text>
                </View>
              ) : (
                tracked.map((item) => (
                  <View key={item.exerciseTemplateId} style={[cardStyle, { flexDirection: 'row', alignItems: 'center', padding: 14 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>{item.exerciseName}</Text>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, textTransform: 'capitalize' }}>{item.exerciseType}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeExercise(item.exerciseTemplateId)}
                      activeOpacity={1}
                      style={{ padding: 8 }}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Add button */}
              <TouchableOpacity
                onPress={() => setStep('pickWorkout')}
                activeOpacity={1}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                  paddingVertical: 14, borderRadius: Radius.lg,
                  backgroundColor: 'rgba(59,130,246,0.12)',
                  borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
                  marginTop: tracked.length > 0 ? 4 : 0,
                }}
              >
                <Plus size={16} color="#3B82F6" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#3B82F6' }}>Add Exercise</Text>
              </TouchableOpacity>

              {tracked.length > 0 && (
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 16 }}>
                  Only these exercises will appear in Personal Records
                </Text>
              )}
            </>
          )}

          {/* ── STEP 2: pick workout ── */}
          {step === 'pickWorkout' && (
            workouts.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 48, gap: 8 }}>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>No workouts found</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Create a workout first</Text>
              </View>
            ) : (
              workouts.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  onPress={() => handleSelectWorkout(workout)}
                  activeOpacity={1}
                  style={[cardStyle, { flexDirection: 'row', alignItems: 'center', padding: 14 }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>{workout.name}</Text>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
              ))
            )
          )}

          {/* ── STEP 3: pick exercise ── */}
          {step === 'pickExercise' && (
            loadingExercises ? (
              <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                <ActivityIndicator color="#3B82F6" />
              </View>
            ) : exercises.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 48, gap: 8 }}>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>No exercises in this workout</Text>
              </View>
            ) : (
              exercises.map((ex) => {
                const alreadyTracked = trackedIds.has(ex.exerciseTemplateId);
                return (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => !alreadyTracked && handleSelectExercise(ex.exerciseTemplateId)}
                    activeOpacity={1}
                    style={[cardStyle, {
                      flexDirection: 'row', alignItems: 'center', padding: 14,
                      opacity: alreadyTracked ? 0.45 : 1,
                    }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>{ex.exerciseName}</Text>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, textTransform: 'capitalize' }}>{ex.exerciseType}</Text>
                    </View>
                    {alreadyTracked ? (
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Already added</Text>
                    ) : (
                      <Plus size={16} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                );
              })
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
