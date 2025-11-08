import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
} from "react-native";
import { ExerciseCard, WorkoutHeader } from "../components/workouts";
import { ExerciseFormModal } from "../components/modals";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";
import {
  getExercisesByWorkoutId,
  deleteExercise,
  updateExercise,
  deleteWorkout,
} from "../services/database";

/**
 * ExecuteWorkoutScreen
 * Screen for viewing, editing, and executing workout plans
 * Uses modular components and shared design system
 */
export default function ExecuteWorkoutScreen({ navigation, route }) {
  const { workoutId, workoutName, planId, planName } = route.params;
  // Support both workoutId/workoutName (new) and planId/planName (legacy)
  const actualWorkoutId = workoutId || planId;
  const actualWorkoutName = workoutName || planName;

  const [exercises, setExercises] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editingExerciseId, setEditingExerciseId] = React.useState(null);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editExercise, setEditExercise] = React.useState({
    name: "",
    sets: "3",
    reps: "10",
    weight: "",
    restTime: "",
  });

  // Load exercises for this workout
  React.useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true);
        const workoutExercises = await getExercisesByWorkoutId(actualWorkoutId);
        setExercises(workoutExercises);
      } catch (error) {
        console.error("ExecuteWorkoutScreen: Error loading exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, [actualWorkoutId]);

  // Handle enable edit mode
  const handleEnableEditMode = () => {
    setIsEditMode(true);
  };

  // Handle disable edit mode
  const handleDisableEditMode = () => {
    setIsEditMode(false);
  };

  // Handle delete workout
  const handleDeleteWorkout = () => {
    Alert.alert(
      "Delete Workout",
      `Are you sure you want to delete "${actualWorkoutName}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteWorkout(actualWorkoutId);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to delete workout");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle delete exercise
  const handleDeleteExercise = (exerciseId, exerciseName) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${exerciseName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteExercise(exerciseId);
              setExercises(exercises.filter((ex) => ex.id !== exerciseId));
            } catch (error) {
              Alert.alert("Error", "Failed to delete exercise");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle edit exercise
  const handleEditExercise = (exercise) => {
    setEditingExerciseId(exercise.id);
    setEditExercise({
      name: exercise.name,
      sets: exercise.sets.toString(),
      reps: exercise.reps.toString(),
      weight: exercise.weight.toString(),
      restTime: exercise.restTime ? exercise.restTime.toString() : "",
    });
    setEditModalVisible(true);
  };

  // Save edited exercise
  const saveEditedExercise = async () => {
    if (!editExercise.name.trim()) {
      Alert.alert("Error", "Please enter an exercise name");
      return;
    }

    try {
      await updateExercise(
        editingExerciseId,
        editExercise.name.trim(),
        parseInt(editExercise.sets) || 3,
        parseInt(editExercise.reps) || 10,
        parseFloat(editExercise.weight) || 0,
        parseInt(editExercise.restTime) || 0,
        ""
      );

      const updatedExercises = exercises.map((ex) =>
        ex.id === editingExerciseId
          ? {
              ...ex,
              name: editExercise.name.trim(),
              sets: parseInt(editExercise.sets) || 3,
              reps: parseInt(editExercise.reps) || 10,
              weight: parseFloat(editExercise.weight) || 0,
              restTime: parseInt(editExercise.restTime) || 0,
            }
          : ex
      );
      setExercises(updatedExercises);
      setEditModalVisible(false);
      setEditingExerciseId(null);
    } catch (error) {
      Alert.alert("Error", "Failed to update exercise");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WorkoutHeader
        title={actualWorkoutName}
        subtitle={`${exercises.length} exercises`}
        isEditMode={isEditMode}
        onEditModeToggle={handleDisableEditMode}
        onMenuPress={() => {
          Alert.alert("Options", "What would you like to do?", [
            {
              text: "Edit Exercises",
              onPress: handleEnableEditMode,
            },
            {
              text: "Delete Workout",
              onPress: handleDeleteWorkout,
              style: "destructive",
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]);
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {loading ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Loading exercises...</Text>
          </View>
        ) : exercises.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No exercises in this plan</Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseCardWrapper}>
              <ExerciseCard
                exercise={exercise}
                showDeleteButton={isEditMode}
                showEditButton={isEditMode}
                onDelete={() => handleDeleteExercise(exercise.id, exercise.name)}
                onEdit={() => handleEditExercise(exercise)}
              />
            </View>
          ))
        )}
      </ScrollView>


      <ExerciseFormModal
        visible={editModalVisible}
        title="Edit Exercise"
        exercise={editExercise}
        onExerciseChange={setEditExercise}
        onSubmit={saveEditedExercise}
        onCancel={() => setEditModalVisible(false)}
        submitButtonText="Save"
        submitButtonIcon="check"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mainBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    paddingBottom: SPACING.container,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  exerciseCardWrapper: {
    marginBottom: SPACING.element,
  },
});
