import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ExerciseCard } from "../components/workouts";
import { ExerciseFormModal, OptionsMenu } from "../components/modals";
import { appStyles } from "../styles/app.styles";
import { COLORS } from "../shared/constants";
import {
  getExercisesByWorkoutId,
  deleteExercise,
  updateExercise,
  deleteWorkout,
} from "../services/database";

/**
 * ExecuteWorkoutScreen
 * Screen for viewing, editing, and executing workout plans
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
  const [menuVisible, setMenuVisible] = React.useState(false);
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
        console.error('ExecuteWorkoutScreen: Error loading exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, [actualWorkoutId]);

  // Handle enable edit mode
  const handleEnableEditMode = () => {
    setMenuVisible(false);
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

  // Menu options
  const menuOptions = [
    {
      label: "Edit Exercises",
      icon: "pencil",
      color: COLORS.info,
      onPress: handleEnableEditMode,
    },
    {
      label: "Delete Workout",
      icon: "trash-can",
      color: COLORS.danger,
      onPress: handleDeleteWorkout,
    },
    {
      label: "Cancel",
      icon: "close",
      color: COLORS.textSecondary,
      onPress: () => {},
    },
  ];

  return (
    <View
      style={[
        appStyles.screenContainer,
        { justifyContent: "flex-start", paddingTop: 0, paddingBottom: 0 },
      ]}
    >
      <View style={appStyles.compactHeader}>
        <View style={{ flex: 1 }}>
          <Text style={appStyles.compactTitle}>{actualWorkoutName}</Text>
          <Text style={appStyles.compactSubtitle}>
            {exercises.length} exercises
          </Text>
        </View>
        {isEditMode && (
          <TouchableOpacity
            onPress={handleDisableEditMode}
            style={appStyles.kebabButton}
          >
            <Text style={appStyles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
        {!isEditMode && (
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={appStyles.kebabButton}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={appStyles.plansList}
        contentContainerStyle={appStyles.plansListContent}
        showsVerticalScrollIndicator={true}
      >
        {loading ? (
          <Text style={appStyles.loadingText}>Loading exercises...</Text>
        ) : exercises.length === 0 ? (
          <Text style={appStyles.emptyText}>No exercises in this plan</Text>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              showDeleteButton={isEditMode}
              showEditButton={isEditMode}
              onDelete={() => handleDeleteExercise(exercise.id, exercise.name)}
              onEdit={() => handleEditExercise(exercise)}
            />
          ))
        )}
      </ScrollView>

      <OptionsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        options={menuOptions}
        title="Options"
      />

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
    </View>
  );
}
