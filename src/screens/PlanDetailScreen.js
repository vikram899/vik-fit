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
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/design';

/**
 * PlanDetailScreen - View plan details and manage exercises
 * Users can:
 * - View all exercises in the plan
 * - Add new exercises to the plan
 * - Edit existing exercises
 * - Delete exercises from the plan
 * - Start workout with this plan
 */
export const PlanDetailScreen = ({ navigation, route }) => {
  const { planId } = route.params;
  const {
    currentPlan,
    loading,
    error,
    loadPlanById,
    addExercise,
    removeExercise,
    updateExercise,
    clearError,
  } = useWorkoutPlans();

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    sets: '3',
    reps: '10',
    weight: '0',
  });

  useEffect(() => {
    loadPlanById(planId);
  }, [planId]);

  const resetForm = () => {
    setExerciseForm({
      name: '',
      sets: '3',
      reps: '10',
      weight: '0',
    });
    setEditingExercise(null);
  };

  const validateExerciseForm = () => {
    if (!exerciseForm.name.trim()) {
      Alert.alert('Validation Error', 'Please enter an exercise name');
      return false;
    }
    if (parseInt(exerciseForm.sets) <= 0) {
      Alert.alert('Validation Error', 'Sets must be greater than 0');
      return false;
    }
    if (parseInt(exerciseForm.reps) <= 0) {
      Alert.alert('Validation Error', 'Reps must be greater than 0');
      return false;
    }
    if (parseInt(exerciseForm.weight) < 0) {
      Alert.alert('Validation Error', 'Weight cannot be negative');
      return false;
    }
    return true;
  };

  const handleAddExercise = async () => {
    if (!validateExerciseForm()) return;

    const result = editingExercise
      ? await updateExercise(editingExercise.id, {
          name: exerciseForm.name.trim(),
          sets: parseInt(exerciseForm.sets),
          reps: parseInt(exerciseForm.reps),
          weight: parseInt(exerciseForm.weight),
        })
      : await addExercise({
          name: exerciseForm.name.trim(),
          sets: parseInt(exerciseForm.sets),
          reps: parseInt(exerciseForm.reps),
          weight: parseInt(exerciseForm.weight),
        });

    if (result.success) {
      Alert.alert(
        'Success',
        editingExercise ? 'Exercise updated successfully' : 'Exercise added successfully'
      );
      resetForm();
      setIsAddingExercise(false);
    } else {
      Alert.alert('Error', 'Failed to save exercise. Please try again.');
    }
  };

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setExerciseForm({
      name: exercise.name,
      sets: String(exercise.sets),
      reps: String(exercise.reps),
      weight: String(exercise.weight),
    });
    setIsAddingExercise(true);
  };

  const handleDeleteExercise = (exercise) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to remove "${exercise.name}" from this plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const result = await removeExercise(exercise.id);
            if (result.success) {
              Alert.alert('Success', 'Exercise removed');
            } else {
              Alert.alert('Error', 'Failed to remove exercise');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleStartWorkout = () => {
    if (!currentPlan || !(currentPlan.exercises || []).length) {
      Alert.alert('No Exercises', 'Please add at least one exercise to the plan before starting a workout');
      return;
    }
    // Navigate to WorkoutExecutionScreen with this plan
    navigation.navigate('WorkoutExecution', { planId: currentPlan.id });
  };

  const renderExerciseItem = ({ item: exercise }) => (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <View style={styles.exerciseStats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Sets</Text>
            <Text style={styles.statValue}>{exercise.sets}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Reps</Text>
            <Text style={styles.statValue}>{exercise.reps}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Weight (kg)</Text>
            <Text style={styles.statValue}>{exercise.weight}</Text>
          </View>
        </View>
      </View>
      <View style={styles.exerciseActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditExercise(exercise)}
        >
          <MaterialIcons name="edit" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteExercise(exercise)}
        >
          <MaterialIcons name="delete-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !currentPlan) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Plan Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={40} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              clearError();
              loadPlanById(planId);
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
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
          <Text style={styles.title}>Plan Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Plan Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.planCard}>
          <Text style={styles.planName}>{currentPlan.name}</Text>
          <Text style={styles.planDescription}>{currentPlan.description}</Text>
          <Text style={styles.exerciseCountBadge}>
            {(currentPlan.exercises || []).length} exercise{(currentPlan.exercises || []).length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => {
                resetForm();
                setIsAddingExercise(true);
              }}
            >
              <MaterialIcons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {!(currentPlan.exercises || []).length ? (
            <View style={styles.emptyExercises}>
              <MaterialIcons name="fit-screen" size={40} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>No exercises yet</Text>
              <Text style={styles.emptySubtext}>Add exercises to begin</Text>
            </View>
          ) : (
            <FlatList
              data={currentPlan.exercises}
              renderItem={renderExerciseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={handleStartWorkout}
          disabled={!(currentPlan.exercises || []).length}
        >
          <MaterialIcons name="play-arrow" size={20} color={COLORS.white} />
          <Text style={styles.buttonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isAddingExercise}
        animationType="slide"
        onRequestClose={() => {
          resetForm();
          setIsAddingExercise(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setIsAddingExercise(false);
              }}
            >
              <Text style={styles.modalHeaderButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingExercise ? 'Edit Exercise' : 'Add Exercise'}
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Exercise Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Bench Press"
                value={exerciseForm.name}
                onChangeText={(text) =>
                  setExerciseForm((prev) => ({ ...prev, name: text }))
                }
                maxLength={50}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Sets *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  value={exerciseForm.sets}
                  onChangeText={(text) =>
                    setExerciseForm((prev) => ({ ...prev, sets: text }))
                  }
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Reps *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  value={exerciseForm.reps}
                  onChangeText={(text) =>
                    setExerciseForm((prev) => ({ ...prev, reps: text }))
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={exerciseForm.weight}
                onChangeText={(text) =>
                  setExerciseForm((prev) => ({ ...prev, weight: text }))
                }
                keyboardType="decimal-pad"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                resetForm();
                setIsAddingExercise(false);
              }}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleAddExercise}
            >
              <Text style={styles.buttonText}>
                {editingExercise ? 'Update' : 'Add'} Exercise
              </Text>
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  planName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  exerciseCountBadge: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  addExerciseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: 8,
  },
  exerciseStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray,
    marginBottom: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: 8,
  },
  emptyExercises: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray,
    marginTop: SPACING.sm,
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
  startButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.error,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.error,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
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
  saveButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
});
