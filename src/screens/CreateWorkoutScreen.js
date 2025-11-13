import React from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Toast } from "../components/common";
import { ExerciseFormModal } from "../components/modals";
import { ExercisesSection, Button, FormInput } from "../shared/components/ui";
import { COLORS, SPACING, TYPOGRAPHY } from "../shared/constants";
import { addWorkout, addExercise } from "../services/database";

/**
 * CreateWorkoutScreen
 * Page screen for creating new workout plans with exercises
 * Uses modular components and shared design system
 */
export default function CreateWorkoutScreen({ navigation }) {
  const [workoutName, setWorkoutName] = React.useState("");
  const [exercises, setExercises] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastType, setToastType] = React.useState("info");

  // Modal state
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalExercise, setModalExercise] = React.useState({
    name: "",
    sets: "3",
    reps: "10",
    weight: "",
    time: "",
  });

  const showToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const openAddExerciseModal = () => {
    if (!workoutName.trim()) {
      showToast("Please enter a workout name first", "warning");
      return;
    }
    setModalExercise({ name: "", sets: "3", reps: "10", weight: "", time: "" });
    setModalVisible(true);
  };

  const addExerciseFromModal = () => {
    if (!modalExercise.name.trim()) {
      showToast("Please enter an exercise name", "warning");
      return;
    }

    const newExerciseId = Date.now();
    setExercises([
      ...exercises,
      {
        id: newExerciseId,
        name: modalExercise.name.trim(),
        sets: modalExercise.sets,
        reps: modalExercise.reps,
        weight: modalExercise.weight,
        restTime: modalExercise.restTime,
      },
    ]);
    setModalVisible(false);
    showToast("Exercise added!", "success");
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalExercise({ name: "", sets: "3", reps: "10", weight: "", restTime: "" });
  };

  const handleDeleteExercise = (id) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleCreateWorkout = async () => {
    if (!workoutName.trim()) {
      showToast("Please enter a workout name", "error");
      return;
    }

    try {
      setLoading(true);
      const workoutId = await addWorkout(workoutName.trim(), "");

      // Add all exercises to the workout
      for (const exercise of exercises) {
        if (exercise.name.trim()) {
          await addExercise(
            workoutId,
            exercise.name.trim(),
            parseInt(exercise.sets) || 3,
            parseInt(exercise.reps) || 10,
            parseFloat(exercise.weight) || 0,
            parseInt(exercise.restTime) || 0,
            "",
            exercise.targetBodyParts || []
          );
        }
      }

      showToast("Workout created successfully!", "success");
      setTimeout(() => {
        setWorkoutName("");
        setExercises([]);
        navigation.goBack();
      }, 1500);
    } catch (error) {
      showToast("Failed to create workout", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
        >
          {/* Workout Name Input */}
          <FormInput
            label="Workout Name"
            placeholder="e.g., Upper Body, Lower Body"
            value={workoutName}
            onChangeText={setWorkoutName}
            editable={!loading}
          />

          {/* Exercises Section */}
          <ExercisesSection
            exercises={exercises}
            onAddExercise={openAddExerciseModal}
            onDeleteExercise={handleDeleteExercise}
            loading={loading}
            emptyMessage="No exercises yet. Tap + to add one."
          />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <Button
              label={loading ? "Creating..." : "Create"}
              icon="check"
              iconPosition="left"
              variant="primary"
              size="medium"
              onPress={handleCreateWorkout}
              isLoading={loading}
              isDisabled={loading}
              fullWidth
            />
          </View>

          <View style={styles.buttonWrapper}>
            <Button
              label="Cancel"
              variant="cancel"
              size="medium"
              onPress={() => navigation.goBack()}
              isDisabled={loading}
              fullWidth
            />
          </View>
        </View>

        {/* Exercise Form Modal */}
        <ExerciseFormModal
          visible={modalVisible}
          title="Add Exercise"
          exercise={modalExercise}
          onExerciseChange={setModalExercise}
          onSubmit={addExerciseFromModal}
          onCancel={closeModal}
          submitButtonText="Add"
          submitButtonIcon="plus"
        />

        {/* Toast Notification */}
        <Toast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    padding: SPACING.element,
    paddingBottom: SPACING.container,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: SPACING.element,
    paddingBottom: SPACING.container,
    backgroundColor: COLORS.mainBackground,
    gap: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondaryBackground,
  },
  buttonWrapper: {
    flex: 1,
  },
});
