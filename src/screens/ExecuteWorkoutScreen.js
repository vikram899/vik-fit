import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ExerciseCard } from "../components/workouts";
import { ExerciseFormModal, OptionsMenu } from "../components/modals";
import { appStyles } from "../styles/app.styles";
import {
  getExercisesByPlanId,
  deleteExercise,
  updateExercise,
  deletePlan,
} from "../services/database";

/**
 * ExecuteWorkoutScreen
 * Screen for viewing, editing, and executing workout plans
 */
export default function ExecuteWorkoutScreen({ navigation, route }) {
  const { planId, planName } = route.params;
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
    time: "",
  });

  // Load exercises for this plan
  React.useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true);
        const planExercises = await getExercisesByPlanId(planId);
        setExercises(planExercises);
      } catch (error) {
        console.error("Error loading exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, [planId]);

  // Handle enable edit mode
  const handleEnableEditMode = () => {
    setMenuVisible(false);
    setIsEditMode(true);
  };

  // Handle disable edit mode
  const handleDisableEditMode = () => {
    setIsEditMode(false);
  };

  // Handle delete plan
  const handleDeletePlan = () => {
    Alert.alert(
      "Delete Plan",
      `Are you sure you want to delete "${planName}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deletePlan(planId);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to delete plan");
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
          onPress: () => console.log("Delete cancelled"),
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
      time: exercise.time ? exercise.time.toString() : "",
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
        parseInt(editExercise.time) || 0,
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
              time: parseInt(editExercise.time) || 0,
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
      color: "#007AFF",
      onPress: handleEnableEditMode,
    },
    {
      label: "Delete Plan",
      icon: "trash-can",
      color: "#FF3B30",
      onPress: handleDeletePlan,
    },
    {
      label: "Cancel",
      icon: "close",
      color: "#666",
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
          <Text style={appStyles.compactTitle}>{planName}</Text>
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
              color="#000"
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
