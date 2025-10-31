import React from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Toast } from "../components/common";
import { ExerciseCard } from "../components/workouts";
import { ExerciseFormModal } from "../components/modals";
import { appStyles } from "../styles/app.styles";
import { addWorkout, addExercise } from "../services/database";

/**
 * CreatePlanScreen
 * Screen for creating new workout plans with exercises
 */
export default function CreatePlanScreen({ navigation }) {
  const [planName, setPlanName] = React.useState("");
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
    if (!planName.trim()) {
      showToast("Please enter a plan name first", "warning");
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

  const removeExercise = (id) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      showToast("Please enter a workout name", "error");
      return;
    }

    try {
      setLoading(true);
      const workoutId = await addWorkout(planName.trim(), "");

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
            ""
          );
        }
      }

      showToast("Workout created successfully!", "success");
      setTimeout(() => {
        setPlanName("");
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
      <View
        style={[
          appStyles.screenContainer,
          { justifyContent: "flex-start", paddingTop: 0, paddingBottom: 0 },
        ]}
      >
        <ScrollView
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={appStyles.formContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
        >
          <View style={appStyles.formGroup}>
            <Text style={appStyles.label}>Plan Name</Text>
            <TextInput
              style={appStyles.input}
              placeholder="e.g., Upper Body, Lower Body"
              placeholderTextColor="#999"
              value={planName}
              onChangeText={setPlanName}
              editable={!loading}
            />
          </View>

          <View style={appStyles.exercisesSection}>
            <View style={appStyles.sectionHeader}>
              <Text style={appStyles.sectionTitle}>Exercises</Text>
              <TouchableOpacity
                onPress={openAddExerciseModal}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={24}
                  color={loading ? "#ccc" : "#007AFF"}
                />
              </TouchableOpacity>
            </View>

            {exercises.length === 0 ? (
              <Text style={appStyles.emptyExercisesText}>
                No exercises yet. Tap + to add one.
              </Text>
            ) : (
              exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onDelete={() => removeExercise(exercise.id)}
                  showDeleteButton={true}
                  disabled={loading}
                />
              ))
            )}
          </View>
        </ScrollView>

        <View style={appStyles.buttonGroupFixed}>
          <TouchableOpacity
            style={[
              appStyles.button,
              appStyles.buttonHalf,
              loading && appStyles.buttonDisabled,
            ]}
            onPress={handleCreatePlan}
            disabled={loading}
          >
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
            <Text style={appStyles.buttonText}>
              {loading ? "Creating..." : "Create"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[appStyles.button, appStyles.buttonHalf, appStyles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={appStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

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

        <Toast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
