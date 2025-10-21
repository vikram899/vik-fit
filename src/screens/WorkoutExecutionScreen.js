import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useWorkoutPlans } from '../hooks/useWorkoutPlans';
import { useWorkouts } from '../hooks/useWorkouts';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/design';

/**
 * WorkoutExecutionScreen - Log active workout from a plan
 * Users can:
 * - Log sets, reps, and weight for each exercise in the plan
 * - Add exercises progressively (not in the original plan)
 * - Finish workout and save to workout log
 */
export const WorkoutExecutionScreen = ({ navigation, route }) => {
  const { planId } = route.params;
  const { currentPlan, loadPlanById } = useWorkoutPlans();
  const { saveWorkout } = useWorkouts();

  const [workoutStart] = useState(new Date());
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: '',
    sets: '3',
    reps: '10',
    weight: '0',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      await loadPlanById(planId);
      setLoading(false);
    };
    loadPlan();
  }, [planId]);

  useEffect(() => {
    // Initialize exercise logs from plan exercises
    if (currentPlan && currentPlan.exercises && exerciseLogs.length === 0) {
      const initialLogs = currentPlan.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        isFromPlan: true,
        completed: false,
        sets: [
          {
            setNumber: 1,
            reps: ex.reps,
            weight: ex.weight,
          },
        ],
      }));
      setExerciseLogs(initialLogs);
    }
  }, [currentPlan]);

  const addSetToExercise = (exerciseId) => {
    setExerciseLogs((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const nextSetNumber = ex.sets.length + 1;
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                setNumber: nextSetNumber,
                reps: ex.sets[ex.sets.length - 1]?.reps || '10',
                weight: ex.sets[ex.sets.length - 1]?.weight || '0',
              },
            ],
          };
        }
        return ex;
      })
    );
  };

  const removeSetFromExercise = (exerciseId, setNumber) => {
    setExerciseLogs((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId && ex.sets.length > 1) {
          return {
            ...ex,
            sets: ex.sets.filter((s) => s.setNumber !== setNumber),
          };
        }
        return ex;
      })
    );
  };

  const updateSet = (exerciseId, setNumber, field, value) => {
    setExerciseLogs((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((s) =>
              s.setNumber === setNumber ? { ...s, [field]: value } : s
            ),
          };
        }
        return ex;
      })
    );
  };

  const toggleExerciseComplete = (exerciseId) => {
    setExerciseLogs((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      )
    );
  };

  const validateNewExerciseForm = () => {
    if (!newExerciseForm.name.trim()) {
      Alert.alert('Validation Error', 'Please enter an exercise name');
      return false;
    }
    return true;
  };

  const handleAddNewExercise = () => {
    if (!validateNewExerciseForm()) return;

    const newExerciseId = `extra-${Date.now()}`;
    const newExercise = {
      id: newExerciseId,
      name: newExerciseForm.name.trim(),
      isFromPlan: false,
      completed: false,
      sets: [
        {
          setNumber: 1,
          reps: parseInt(newExerciseForm.reps) || 10,
          weight: parseInt(newExerciseForm.weight) || 0,
        },
      ],
    };

    setExerciseLogs((prev) => [...prev, newExercise]);
    setNewExerciseForm({
      name: '',
      sets: '3',
      reps: '10',
      weight: '0',
    });
    setIsAddingExercise(false);
  };

  const handleRemoveExerciseLog = (exerciseId) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise from your workout log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            setExerciseLogs((prev) => prev.filter((ex) => ex.id !== exerciseId));
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleFinishWorkout = async () => {
    if (exerciseLogs.length === 0) {
      Alert.alert('Empty Workout', 'Please log at least one exercise');
      return;
    }

    const completedExercises = exerciseLogs.filter((ex) => ex.completed);
    if (completedExercises.length === 0) {
      Alert.alert('No Exercises Completed', 'Please mark at least one exercise as completed');
      return;
    }

    Alert.alert(
      'Finish Workout?',
      `You completed ${completedExercises.length} exercise${completedExercises.length !== 1 ? 's' : ''}. Save to workout log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            setIsSubmitting(true);
            const workoutData = {
              planId: currentPlan?.id,
              planName: currentPlan?.name,
              startTime: workoutStart.toISOString(),
              endTime: new Date().toISOString(),
              duration: Math.round((new Date() - workoutStart) / 60000), // in minutes
              exercises: exerciseLogs.map((ex) => ({
                name: ex.name,
                sets: ex.sets.map((s) => ({
                  reps: parseInt(s.reps) || 0,
                  weight: parseInt(s.weight) || 0,
                })),
                completed: ex.completed,
              })),
            };

            const result = await saveWorkout(workoutData);
            setIsSubmitting(false);

            if (result.success) {
              Alert.alert('Success', 'Workout saved!', [
                {
                  text: 'Back to Plans',
                  onPress: () => {
                    navigation.navigate('WorkoutPlans');
                  },
                },
              ]);
            } else {
              Alert.alert('Error', 'Failed to save workout');
            }
          },
        },
      ]
    );
  };

  const workoutDuration = Math.round((new Date() - workoutStart) / 60000);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!currentPlan) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Workout</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Plan not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{currentPlan.name}</Text>
          <Text style={styles.duration}>{workoutDuration} minutes</Text>
        </View>
        <TouchableOpacity onPress={handleFinishWorkout} disabled={isSubmitting}>
          <MaterialIcons
            name="check"
            size={24}
            color={isSubmitting ? COLORS.gray : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} scrollEnabled={true}>
        {exerciseLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="fit-screen" size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>No exercises loaded</Text>
          </View>
        ) : (
          <View>
            {exerciseLogs.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseSection}>
                <View style={styles.exerciseHeader}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => toggleExerciseComplete(exercise.id)}
                  >
                    <View
                      style={[
                        styles.checkboxInner,
                        exercise.completed && styles.checkboxChecked,
                      ]}
                    >
                      {exercise.completed && (
                        <MaterialIcons name="check" size={16} color={COLORS.white} />
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.exerciseTitleContainer}>
                    <Text
                      style={[
                        styles.exerciseTitle,
                        exercise.completed && styles.exerciseTitleCompleted,
                      ]}
                    >
                      {exercise.name}
                    </Text>
                    {!exercise.isFromPlan && (
                      <View style={styles.extraBadge}>
                        <Text style={styles.extraBadgeText}>Added</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveExerciseLog(exercise.id)}>
                    <MaterialIcons name="close" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.setsContainer}>
                  {exercise.sets.map((set) => (
                    <View key={`${exercise.id}-set-${set.setNumber}`} style={styles.setRow}>
                      <Text style={styles.setNumber}>Set {set.setNumber}</Text>
                      <View style={styles.setInputs}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Reps</Text>
                          <TextInput
                            style={styles.setInput}
                            value={String(set.reps)}
                            onChangeText={(val) =>
                              updateSet(exercise.id, set.setNumber, 'reps', val)
                            }
                            keyboardType="number-pad"
                            placeholder="0"
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Weight (kg)</Text>
                          <TextInput
                            style={styles.setInput}
                            value={String(set.weight)}
                            onChangeText={(val) =>
                              updateSet(exercise.id, set.setNumber, 'weight', val)
                            }
                            keyboardType="decimal-pad"
                            placeholder="0"
                          />
                        </View>
                        {exercise.sets.length > 1 && (
                          <TouchableOpacity
                            style={styles.removeSetButton}
                            onPress={() =>
                              removeSetFromExercise(exercise.id, set.setNumber)
                            }
                          >
                            <MaterialIcons name="close" size={16} color={COLORS.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.addSetButton}
                  onPress={() => addSetToExercise(exercise.id)}
                >
                  <MaterialIcons name="add" size={18} color={COLORS.primary} />
                  <Text style={styles.addSetText}>Add Set</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addExerciseCard}
              onPress={() => setIsAddingExercise(true)}
            >
              <MaterialIcons name="add-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.finishButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleFinishWorkout}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Finish & Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isAddingExercise}
        animationType="slide"
        onRequestClose={() => setIsAddingExercise(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsAddingExercise(false)}>
              <Text style={styles.modalHeaderButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Exercise Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Barbell Curls"
                value={newExerciseForm.name}
                onChangeText={(text) =>
                  setNewExerciseForm((prev) => ({ ...prev, name: text }))
                }
                maxLength={50}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Reps</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  value={newExerciseForm.reps}
                  onChangeText={(text) =>
                    setNewExerciseForm((prev) => ({ ...prev, reps: text }))
                  }
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={newExerciseForm.weight}
                  onChangeText={(text) =>
                    setNewExerciseForm((prev) => ({ ...prev, weight: text }))
                  }
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsAddingExercise(false)}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAddNewExercise}
            >
              <Text style={styles.buttonText}>Add to Workout</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  duration: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  exerciseSection: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  checkbox: {
    padding: 4,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  exerciseTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  exerciseTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  exerciseTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  extraBadge: {
    backgroundColor: COLORS.lightBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  extraBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  setsContainer: {
    gap: SPACING.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  setNumber: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray,
    minWidth: 40,
  },
  setInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray,
    marginBottom: 2,
  },
  setInput: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
  },
  removeSetButton: {
    padding: 6,
    marginTop: 12,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
  },
  addSetText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  addExerciseCard: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  addExerciseText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  button: {
    paddingVertical: SPACING.md,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  finishButton: {
    backgroundColor: COLORS.success,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  modalHeaderButton: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    flex: 1,
  },
  cancelButtonText: {
    color: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
});
